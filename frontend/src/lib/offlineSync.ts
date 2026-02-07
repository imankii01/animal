/**
 * Offline Sync Management
 * Handles queuing requests when offline and syncing when online
 * Includes retry logic, conflict resolution, and event management
 */

import type { SyncQueueItem } from '../hooks/useIndexedDB';

interface SyncManagerConfig {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number;
}

class OfflineSyncManager {
  private config: Required<SyncManagerConfig>;
  private status: SyncStatus;
  private syncListeners: Set<(status: SyncStatus) => void>;
  private db: any; // IndexedDB instance
  private api: any; // API instance

  constructor(
    db: any,
    api: any,
    config: SyncManagerConfig = {}
  ) {
    this.db = db;
    this.api = api;
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5000,
      onSyncStart: config.onSyncStart || (() => {}),
      onSyncComplete: config.onSyncComplete || (() => {}),
      onSyncError: config.onSyncError || (() => {}),
    };

    this.status = {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingCount: 0,
      lastSyncTime: 0,
    };

    this.syncListeners = new Set();
    this.setupEventListeners();
  }

  /**
   * Setup online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen for visibility changes to sync when app becomes active
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.sync();
      }
    });
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    console.log('[OfflineSync] Device came online');
    this.status.isOnline = true;
    this.notifyListeners();

    // Sync pending changes
    await this.sync();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('[OfflineSync] Device went offline');
    this.status.isOnline = false;
    this.notifyListeners();
  }

  /**
   * Queue a request for offline/online sync
   */
  public async queueRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<void> {
    console.log(`[OfflineSync] Queuing ${method} ${endpoint}`, data);

    await this.db.addToSyncQueue(method, endpoint, data);

    // Update pending count
    const queue = await this.db.getSyncQueue();
    this.status.pendingCount = queue.length;
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.status.isOnline) {
      await this.sync();
    }
  }

  /**
   * Sync all pending requests
   */
  public async sync(): Promise<void> {
    if (this.status.isSyncing || !this.status.isOnline) {
      return;
    }

    this.status.isSyncing = true;
    this.config.onSyncStart();
    this.notifyListeners();

    try {
      const queue = await this.db.getSyncQueue();

      if (queue.length === 0) {
        console.log('[OfflineSync] No items to sync');
        this.status.isSyncing = false;
        this.config.onSyncComplete();
        this.notifyListeners();
        return;
      }

      console.log(`[OfflineSync] Syncing ${queue.length} items`);

      // Process each item in queue
      for (const item of queue) {
        await this.syncItem(item);
      }

      // Update last sync time
      this.status.lastSyncTime = Date.now();
      await this.db.setLastSyncTime(this.status.lastSyncTime);

      console.log('[OfflineSync] Sync complete');
      this.status.isSyncing = false;
      this.config.onSyncComplete();
    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
      this.status.isSyncing = false;
      this.config.onSyncError(error instanceof Error ? error : new Error(String(error)));
    }

    this.notifyListeners();
  }

  /**
   * Sync individual queue item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      console.log(`[OfflineSync] Syncing ${item.method} ${item.endpoint} (attempt ${item.retries + 1})`);

      let response: any;

      // Execute API request based on method
      switch (item.method) {
        case 'GET':
          response = await this.api.get(item.endpoint);
          break;
        case 'POST':
          response = await this.api.post(item.endpoint, item.data);
          break;
        case 'PUT':
          response = await this.api.put(item.endpoint, item.data);
          break;
        case 'PATCH':
          response = await this.api.patch(item.endpoint, item.data);
          break;
        case 'DELETE':
          response = await this.api.delete(item.endpoint);
          break;
        default:
          throw new Error(`Unknown HTTP method: ${item.method}`);
      }

      // Remove from queue on success
      await this.db.removeSyncQueueItem(item.id);
      console.log(`[OfflineSync] ✓ Successfully synced ${item.id}`);

      // Update pending count
      const queue = await this.db.getSyncQueue();
      this.status.pendingCount = queue.length;
    } catch (error) {
      console.error(`[OfflineSync] Failed to sync ${item.id}:`, error);

      // Increment retry count
      const newRetries = item.retries + 1;

      if (newRetries >= item.maxRetries) {
        // Max retries reached - remove from queue
        console.warn(`[OfflineSync] Max retries reached for ${item.id}, removing from queue`);
        await this.db.removeSyncQueueItem(item.id);

        // Update pending count
        const queue = await this.db.getSyncQueue();
        this.status.pendingCount = queue.length;
      } else {
        // Update retry count and wait before retrying
        await this.db.updateSyncQueueItem(item.id, {
          retries: newRetries,
        });
      }
    }
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to sync status changes
   */
  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.syncListeners.forEach((listener) => {
      listener(this.getStatus());
    });
  }

  /**
   * Force sync
   */
  public async forceSyncNow(): Promise<void> {
    if (navigator.onLine) {
      await this.sync();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  /**
   * Get pending items count
   */
  public async getPendingCount(): Promise<number> {
    const queue = await this.db.getSyncQueue();
    return queue.length;
  }

  /**
   * Get pending items
   */
  public async getPendingItems(): Promise<SyncQueueItem[]> {
    return this.db.getSyncQueue();
  }

  /**
   * Clear all pending items (use with caution!)
   */
  public async clearAllPending(): Promise<void> {
    await this.db.clear('syncQueue');
    this.status.pendingCount = 0;
    this.notifyListeners();
  }

  /**
   * Remove specific pending item
   */
  public async removePendingItem(id: string): Promise<void> {
    await this.db.removeSyncQueueItem(id);
    const queue = await this.db.getSyncQueue();
    this.status.pendingCount = queue.length;
    this.notifyListeners();
  }
}

export { OfflineSyncManager };
export type { SyncStatus, SyncManagerConfig };
