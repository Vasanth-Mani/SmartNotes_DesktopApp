import { describe, it, expect } from 'vitest';
import { stripHtml, exportToTxt, exportToJson, parseImportJson, searchNotes } from '../utils';
import type { Category, Note } from '../types';

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Java', order: 0, createdAt: 1000, updatedAt: 1000 },
  { id: 'cat2', name: 'Python', order: 1, createdAt: 1000, updatedAt: 1000 },
];

const mockNotes: Note[] = [
  {
    id: 'note1',
    categoryId: 'cat1',
    question: 'What is a HashMap?',
    answer: '<p>A <strong>HashMap</strong> is a data structure.</p>',
    tags: ['collections', 'data-structures'],
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: 'note2',
    categoryId: 'cat2',
    question: 'How to use list comprehension?',
    answer: '<p>Use <code>[x for x in range(10)]</code></p>',
    tags: ['syntax', 'lists'],
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: 'note3',
    categoryId: 'cat1',
    question: 'Explain Interfaces',
    answer: '<p>An interface defines a contract.</p>',
    tags: ['oop'],
    createdAt: 1000,
    updatedAt: 1000,
  },
];

describe('stripHtml', () => {
  it('should strip HTML tags', () => {
    expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('should handle plain text', () => {
    expect(stripHtml('no tags here')).toBe('no tags here');
  });
});

describe('exportToTxt', () => {
  it('should produce readable text with categories and notes', () => {
    const txt = exportToTxt(mockCategories, mockNotes);
    expect(txt).toContain('SmartNotes Export');
    expect(txt).toContain('Java');
    expect(txt).toContain('What is a HashMap?');
    expect(txt).toContain('A HashMap is a data structure.');
    expect(txt).toContain('Python');
    expect(txt).toContain('How to use list comprehension?');
  });

  it('should include tags when present', () => {
    const txt = exportToTxt(mockCategories, mockNotes);
    expect(txt).toContain('Tags: collections, data-structures');
  });
});

describe('exportToJson / parseImportJson', () => {
  it('should export and re-import correctly', () => {
    const json = exportToJson(mockCategories, mockNotes);
    const parsed = parseImportJson(json);
    expect(parsed.categories).toHaveLength(2);
    expect(parsed.notes).toHaveLength(3);
    expect(parsed.version).toBe(1);
    expect(parsed.categories[0].name).toBe('Java');
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseImportJson('not json')).toThrow();
  });

  it('should throw on missing required fields', () => {
    expect(() => parseImportJson('{"foo": "bar"}')).toThrow('Invalid SmartNotes backup file');
  });
});

describe('searchNotes', () => {
  it('should find notes by question text', () => {
    const results = searchNotes('HashMap', mockNotes, mockCategories);
    expect(results).toHaveLength(1);
    expect(results[0].noteId).toBe('note1');
    expect(results[0].matchField).toBe('question');
  });

  it('should find notes by answer content', () => {
    const results = searchNotes('contract', mockNotes, mockCategories);
    expect(results).toHaveLength(1);
    expect(results[0].noteId).toBe('note3');
    expect(results[0].matchField).toBe('answer');
  });

  it('should find notes by tags', () => {
    const results = searchNotes('oop', mockNotes, mockCategories);
    expect(results).toHaveLength(1);
    expect(results[0].noteId).toBe('note3');
    expect(results[0].matchField).toBe('tags');
  });

  it('should return empty for empty query', () => {
    expect(searchNotes('', mockNotes, mockCategories)).toHaveLength(0);
    expect(searchNotes('  ', mockNotes, mockCategories)).toHaveLength(0);
  });

  it('should be case insensitive', () => {
    const results = searchNotes('hashmap', mockNotes, mockCategories);
    expect(results).toHaveLength(1);
  });

  it('should include category name in results', () => {
    const results = searchNotes('HashMap', mockNotes, mockCategories);
    expect(results[0].categoryName).toBe('Java');
  });

  it('should search across all categories', () => {
    const results = searchNotes('list', mockNotes, mockCategories);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
