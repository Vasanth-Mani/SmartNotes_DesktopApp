import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Category } from '../types';
import { generateId } from '../utils';

export function useCategories() {
  const categories = useLiveQuery(() =>
    db.categories.orderBy('order').toArray(),
  );

  const addCategory = async (name: string) => {
    const maxOrder = categories?.length
      ? Math.max(...categories.map((c) => c.order))
      : -1;
    const now = Date.now();
    const category: Category = {
      id: generateId(),
      name,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };
    await db.categories.add(category);
    return category;
  };

  const renameCategory = async (id: string, name: string) => {
    await db.categories.update(id, { name, updatedAt: Date.now() });
  };

  const deleteCategory = async (
    id: string,
    action: 'move' | 'delete',
  ) => {
    if (action === 'delete') {
      await db.notes.where('categoryId').equals(id).delete();
    } else {
      // Move notes: set categoryId to 'uncategorized'
      // Make sure uncategorized category exists
      let uncat = await db.categories.get('uncategorized');
      if (!uncat) {
        uncat = {
          id: 'uncategorized',
          name: 'Uncategorized',
          order: 9999,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.categories.add(uncat);
      }
      await db.notes
        .where('categoryId')
        .equals(id)
        .modify({ categoryId: 'uncategorized', updatedAt: Date.now() });
    }
    await db.categories.delete(id);
  };

  const reorderCategories = async (reordered: Category[]) => {
    await db.transaction('rw', db.categories, async () => {
      for (let i = 0; i < reordered.length; i++) {
        await db.categories.update(reordered[i].id, {
          order: i,
          updatedAt: Date.now(),
        });
      }
    });
  };

  return {
    categories: categories || [],
    addCategory,
    renameCategory,
    deleteCategory,
    reorderCategories,
  };
}
