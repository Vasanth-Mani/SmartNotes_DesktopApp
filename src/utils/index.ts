import { v4 as uuidv4 } from 'uuid';
import type { Category, Note, ExportData } from '../types';

export function generateId(): string {
  return uuidv4();
}

export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function exportToTxt(categories: Category[], notes: Note[]): string {
  const lines: string[] = [];
  lines.push('=== SmartNotes Export ===');
  lines.push(`Exported: ${new Date().toLocaleString()}`);
  lines.push('');

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  for (const cat of sortedCategories) {
    const catNotes = notes.filter((n) => n.categoryId === cat.id);
    if (catNotes.length === 0) continue;

    lines.push(`── ${cat.name} ──`);
    lines.push('');

    for (const note of catNotes) {
      lines.push(`Q: ${note.question}`);
      lines.push(`A: ${stripHtml(note.answer)}`);
      if (note.tags.length > 0) {
        lines.push(`Tags: ${note.tags.join(', ')}`);
      }
      lines.push('');
    }
    lines.push('');
  }

  // Uncategorized notes
  const uncategorized = notes.filter(
    (n) => !categories.some((c) => c.id === n.categoryId),
  );
  if (uncategorized.length > 0) {
    lines.push('── Uncategorized ──');
    lines.push('');
    for (const note of uncategorized) {
      lines.push(`Q: ${note.question}`);
      lines.push(`A: ${stripHtml(note.answer)}`);
      if (note.tags.length > 0) {
        lines.push(`Tags: ${note.tags.join(', ')}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function exportToJson(categories: Category[], notes: Note[]): string {
  const data: ExportData = {
    version: 1,
    exportedAt: Date.now(),
    categories,
    notes,
  };
  return JSON.stringify(data, null, 2);
}

export function parseImportJson(json: string): ExportData {
  const data = JSON.parse(json) as ExportData;
  if (!data.version || !Array.isArray(data.categories) || !Array.isArray(data.notes)) {
    throw new Error('Invalid SmartNotes backup file');
  }
  return data;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface SearchResult {
  noteId: string;
  categoryId: string;
  categoryName: string;
  question: string;
  matchField: 'question' | 'answer' | 'tags';
  snippet: string;
}

export function searchNotes(
  query: string,
  notes: Note[],
  categories: Category[],
): SearchResult[] {
  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  const results: SearchResult[] = [];
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  for (const note of notes) {
    const catName = catMap.get(note.categoryId) || 'Uncategorized';

    if (note.question.toLowerCase().includes(lower)) {
      results.push({
        noteId: note.id,
        categoryId: note.categoryId,
        categoryName: catName,
        question: note.question,
        matchField: 'question',
        snippet: note.question,
      });
      continue;
    }

    const plainAnswer = stripHtml(note.answer).toLowerCase();
    if (plainAnswer.includes(lower)) {
      const idx = plainAnswer.indexOf(lower);
      const start = Math.max(0, idx - 30);
      const end = Math.min(plainAnswer.length, idx + lower.length + 30);
      const snippet = (start > 0 ? '...' : '') + plainAnswer.slice(start, end) + (end < plainAnswer.length ? '...' : '');
      results.push({
        noteId: note.id,
        categoryId: note.categoryId,
        categoryName: catName,
        question: note.question,
        matchField: 'answer',
        snippet,
      });
      continue;
    }

    if (note.tags.some((t) => t.toLowerCase().includes(lower))) {
      results.push({
        noteId: note.id,
        categoryId: note.categoryId,
        categoryName: catName,
        question: note.question,
        matchField: 'tags',
        snippet: `Tags: ${note.tags.join(', ')}`,
      });
    }
  }

  return results;
}
