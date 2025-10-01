import { openDB, DBSchema } from 'idb';
import type { Invoice } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SyncDB extends DBSchema {
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      payload: Invoice | string; 
    };
  };
}

const dbPromise = openDB<SyncDB>('fast-managment-sync-db', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 2) {
      if (db.objectStoreNames.contains('syncQueue')) {
          db.deleteObjectStore('syncQueue');
      }
      db.createObjectStore('syncQueue', {
        keyPath: 'id',
      });
    }
  },
});

export const addToSyncQueue = async (item: { type: 'create' | 'update' | 'delete', payload: Invoice | string }) => {
  const db = await dbPromise;
  await db.add('syncQueue', { id: uuidv4(), ...item });
};

export const getSyncQueue = async () => {
  const db = await dbPromise;
  return db.getAll('syncQueue');
};

export const deleteFromSyncQueue = async (id: string) => {
    const db = await dbPromise;
    await db.delete('syncQueue', id);
};