/**
 * Enhanced API Client with Offline Support
 * Extends basic API to handle offline requests via sync queue
 */

import type { OfflineSyncManager } from './offlineSync';
import type { SyncStatus } from './offlineSync';

/**
 * Enhanced API Client that supports offline mode
 * Queues requests when offline and syncs when online
 */
class APIClient {
  private baseURL: string;
  private syncManager: OfflineSyncManager | null = null;
  private offlineMode: boolean = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Set the offline sync manager (call after it's initialized)
   */
  public setSyncManager(syncManager: OfflineSyncManager): void {
    this.syncManager = syncManager;
    this.setupSyncSubscription();
  }

  /**
   * Setup subscription to sync status changes
   */
  private setupSyncSubscription(): void {
    if (!this.syncManager) return;

    this.syncManager.subscribe((status: SyncStatus) => {
      console.log('[APIClient] Sync status updated:', status);
      // Can emit events or update UI here
    });
  }

  /**
   * Check if currently offline
   */
  private isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(
    endpoint: string,
    options: {
      useOfflineCache?: boolean;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[APIClient] GET ${endpoint} failed:`, error);

      if (this.isOffline() && options.useOfflineCache && this.syncManager) {
        // Queue for retry when online
        await this.syncManager.queueRequest('GET', endpoint);
      }

      throw error;
    }
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options: {
      queueIfOffline?: boolean;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const shouldQueueOffline = options.queueIfOffline !== false;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[APIClient] POST ${endpoint} failed:`, error);

      if (this.isOffline() && shouldQueueOffline && this.syncManager) {
        console.log(`[APIClient] Queuing POST ${endpoint} for offline sync`);
        await this.syncManager.queueRequest('POST', endpoint, data);
        // Return placeholder response
        return { _id: `offline-${Date.now()}`, ...data } as T;
      }

      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options: {
      queueIfOffline?: boolean;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const shouldQueueOffline = options.queueIfOffline !== false;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[APIClient] PUT ${endpoint} failed:`, error);

      if (this.isOffline() && shouldQueueOffline && this.syncManager) {
        await this.syncManager.queueRequest('PUT', endpoint, data);
        return { _id: 'offline', ...data } as T;
      }

      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    options: {
      queueIfOffline?: boolean;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const shouldQueueOffline = options.queueIfOffline !== false;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[APIClient] PATCH ${endpoint} failed:`, error);

      if (this.isOffline() && shouldQueueOffline && this.syncManager) {
        await this.syncManager.queueRequest('PATCH', endpoint, data);
        return { _id: 'offline', ...data } as T;
      }

      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    options: {
      queueIfOffline?: boolean;
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const shouldQueueOffline = options.queueIfOffline !== false;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[APIClient] DELETE ${endpoint} failed:`, error);

      if (this.isOffline() && shouldQueueOffline && this.syncManager) {
        await this.syncManager.queueRequest('DELETE', endpoint);
        return {} as T;
      }

      throw error;
    }
  }

  /**
   * Check if online
   */
  public isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get sync manager (if available)
   */
  public getSyncManager(): OfflineSyncManager | null {
    return this.syncManager;
  }
}

export { APIClient };
