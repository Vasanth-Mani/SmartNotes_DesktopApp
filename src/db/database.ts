import Dexie, { type Table } from 'dexie';
import type { Category, Note } from '../types';

export class SmartNotesDB extends Dexie {
  categories!: Table<Category, string>;
  notes!: Table<Note, string>;

  constructor() {
    super('SmartNotesDB');
    this.version(1).stores({
      categories: 'id, name, order',
      notes: 'id, categoryId, question, *tags, createdAt',
    });
  }
}

export const db = new SmartNotesDB();
