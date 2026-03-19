import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Note } from '../types';
import { generateId } from '../utils';

export function useNotes(categoryId?: string) {
  const notes = useLiveQuery(() => {
    if (!categoryId) return db.notes.toArray();
    return db.notes.where('categoryId').equals(categoryId).toArray();
  }, [categoryId]);

  const allNotes = useLiveQuery(() => db.notes.toArray());

  const addNote = async (
    data: Pick<Note, 'categoryId' | 'question' | 'answer' | 'tags'>,
  ) => {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.add(note);
    return note;
  };

  const updateNote = async (
    id: string,
    data: Partial<Pick<Note, 'categoryId' | 'question' | 'answer' | 'tags'>>,
  ) => {
    await db.notes.update(id, { ...data, updatedAt: Date.now() });
  };

  const deleteNote = async (id: string) => {
    await db.notes.delete(id);
  };

  return {
    notes: notes || [],
    allNotes: allNotes || [],
    addNote,
    updateNote,
    deleteNote,
  };
}
