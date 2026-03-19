export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  categoryId: string;
  question: string;
  answer: string; // stored as HTML
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ExportData {
  version: number;
  exportedAt: number;
  categories: Category[];
  notes: Note[];
}
