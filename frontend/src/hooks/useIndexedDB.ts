import { useEffect, useRef, useCallback } from 'react';

/**
 * IndexedDB Database Schema and Management
 * Handles offline data persistence for:
 * - Milking Sessions
 * - Milk Sales
 * - Health Records
 * - Sync Queue (for offline requests)
 */

interface IndexedDBConfig {
  dbName: string;
  version: number;
  stores: {
    [storeName: string]: string; // keyPath
  };
}

interface SyncQueueItem {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface OfflineData {
  sessions?: any[];
  sales?: any[];
  healthRecords?: any[];
  syncQueue?: SyncQueueItem[];
}

const DB_CONFIG: IndexedDBConfig = {
  dbName: 'MooMusicTrackerDB',
  version: 1,
  stores: {
    sessions: 'id',
    sales: 'id',
    healthRecords: 'id',
    syncQueue: 'id',
    metadata: 'key',
  },
};

/**
 * Custom hook for IndexedDB operations
 * Provides methods for CRUD operations and sync management
 */
export const useIndexedDB = () => {
  const dbRef = useRef<IDBDatabase | null>(null);
  const initPromise = useRef<Promise<IDBDatabase>>();

  // Initialize IndexedDB
  const initializeDB = useCallback((): Promise<IDBDatabase> => {
    if (initPromise.current) return initPromise.current;

    initPromise.current = new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported in this browser'));
        return;
      }

      const request = window.indexedDB.open(DB_CONFIG.dbName, DB_CONFIG.version);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve(request.result);
      };

      // Create object stores on first run
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        Object.entries(DB_CONFIG.stores).forEach(([storeName, keyPath]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath });
          }
        });
      };
    });

    return initPromise.current;
  }, []);

  // Get all data from a store
  const getAll = useCallback(
    async (storeName: keyof typeof DB_CONFIG.stores): Promise<any[]> => {
      const db = await initializeDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    [initializeDB]
  );

  // Get single item by ID
  const getById = useCallback(
    async (storeName: keyof typeof DB_CONFIG.stores, id: string): Promise<any | null> => {
      const db = await initializeDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    },
    [initializeDB]
  );

  // Add or update item
  const put = useCallback(
    async (storeName: keyof typeof DB_CONFIG.stores, data: any): Promise<string> => {
      const db = await initializeDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as string);
      });
    },
    [initializeDB]
  );

  // Delete item by ID
  const delete_ = useCallback(
    async (storeName: keyof typeof DB_CONFIG.stores, id: string): Promise<void> => {
      const db = await initializeDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    },
    [initializeDB]
  );

  // Clear entire store
  const clear = useCallback(
    async (storeName: keyof typeof DB_CONFIG.stores): Promise<void> => {
      const db = await initializeDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    },
    [initializeDB]
  );

  // Add to sync queue
  const addToSyncQueue = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      endpoint: string,
      data?: any
    ): Promise<string> => {
      const syncItem: SyncQueueItem = {
        id: `${Date.now()}-${Math.random()}`,
        method,
        endpoint,
        data,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: 3,
      };

      return put('syncQueue', syncItem);
    },
    [put]
  );

  // Get sync queue items
  const getSyncQueue = useCallback(async (): Promise<SyncQueueItem[]> => {
    return getAll('syncQueue');
  }, [getAll]);

  // Remove from sync queue
  const removeSyncQueueItem = useCallback(
    async (id: string): Promise<void> => {
      return delete_('syncQueue', id);
    },
    [delete_]
  );

  // Update sync queue item (for retry count)
  const updateSyncQueueItem = useCallback(
    async (id: string, updates: Partial<SyncQueueItem>): Promise<void> => {
      const item = await getById('syncQueue', id);
      if (item) {
        await put('syncQueue', { ...item, ...updates });
      }
    },
    [getById, put]
  );

  // Get last sync timestamp
  const getLastSyncTime = useCallback(async (): Promise<number> => {
    const metadata = await getById('metadata', 'lastSync');
    return metadata?.value || 0;
  }, [getById]);

  // Update last sync timestamp
  const setLastSyncTime = useCallback(
    async (timestamp: number): Promise<void> => {
      await put('metadata', { key: 'lastSync', value: timestamp });
    },
    [put]
  );

  // Get database size estimate
  const getStorageEstimate = useCallback(async (): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
      };
    }
    return { usage: 0, quota: 0, percentage: 0 };
  }, []);

  // Export all offline data
  const exportData = useCallback(
    async (): Promise<OfflineData> => {
      const db = await initializeDB();
      const data: OfflineData = {};

      for (const storeName of Object.keys(DB_CONFIG.stores)) {
        const storeKey = storeName as keyof typeof DB_CONFIG.stores;
        data[storeKey as keyof OfflineData] = await getAll(storeKey);
      }

      return data;
    },
    [initializeDB, getAll]
  );

  // Import offline data
  const importData = useCallback(
    async (data: OfflineData): Promise<void> => {
      const db = await initializeDB();

      for (const [storeName, items] of Object.entries(data)) {
        if (items && Array.isArray(items)) {
          const storeKey = storeName as keyof typeof DB_CONFIG.stores;
          for (const item of items) {
            await put(storeKey, item);
          }
        }
      }
    },
    [initializeDB, put]
  );

  // Reset entire database (for debugging/testing)
  const resetDatabase = useCallback(async (): Promise<void> => {
    if (dbRef.current) {
      dbRef.current.close();
      dbRef.current = null;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(DB_CONFIG.dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        initPromise.current = undefined;
        resolve();
      };
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeDB().catch((error) => {
      console.error('Failed to initialize IndexedDB:', error);
    });

    return () => {
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, [initializeDB]);

  return {
    getAll,
    getById,
    put,
    delete: delete_,
    clear,
    addToSyncQueue,
    getSyncQueue,
    removeSyncQueueItem,
    updateSyncQueueItem,
    getLastSyncTime,
    setLastSyncTime,
    getStorageEstimate,
    exportData,
    importData,
    resetDatabase,
  };
};

export type { SyncQueueItem, OfflineData };
export const DB_CONFIG_EXPORT = DB_CONFIG;
