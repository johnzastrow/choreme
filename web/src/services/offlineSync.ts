interface PendingAction {
  id: string;
  type: 'progress_update' | 'chore_completion' | 'reward_redemption';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineSyncService {
  private dbName = 'choreme_offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for pending actions
        if (!db.objectStoreNames.contains('pendingActions')) {
          const store = db.createObjectStore('pendingActions', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('cachedData')) {
          const store = db.createObjectStore('cachedData', { keyPath: 'key' });
          store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Store for assignments (offline access)
        if (!db.objectStoreNames.contains('assignments')) {
          const store = db.createObjectStore('assignments', { keyPath: 'id' });
          store.createIndex('userId', 'user_id', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  // Add pending action for later sync
  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.init();

    const pendingAction: PendingAction = {
      ...action,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.add(pendingAction);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending actions
  async getPendingActions(): Promise<PendingAction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove pending action after successful sync
  async removePendingAction(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data for offline access
  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    const cacheEntry = {
      key,
      data,
      lastUpdated: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put(cacheEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && this.isCacheValid(result.lastUpdated)) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store assignments for offline access
  async storeAssignments(assignments: any[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assignments'], 'readwrite');
      const store = transaction.objectStore('assignments');

      // Clear existing assignments
      store.clear();

      // Add new assignments
      assignments.forEach(assignment => {
        store.add(assignment);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get offline assignments
  async getOfflineAssignments(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assignments'], 'readonly');
      const store = transaction.objectStore('assignments');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Update assignment progress offline
  async updateAssignmentOffline(assignmentId: string, progress: number): Promise<void> {
    if (!this.db) await this.init();

    // Update local assignment
    const transaction = this.db!.transaction(['assignments'], 'readwrite');
    const store = transaction.objectStore('assignments');
    
    const getRequest = store.get(assignmentId);
    getRequest.onsuccess = () => {
      const assignment = getRequest.result;
      if (assignment) {
        assignment.progress_percentage = progress;
        assignment.status = progress === 100 ? 'pending_approval' : 'in_progress';
        store.put(assignment);
      }
    };

    // Add to pending actions
    await this.addPendingAction({
      type: 'progress_update',
      data: { assignmentId, progress }
    });
  }

  // Sync pending actions when online
  async syncPendingActions(): Promise<void> {
    if (!navigator.onLine) return;

    const pendingActions = await this.getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await this.processPendingAction(action);
        await this.removePendingAction(action.id);
        console.log(`Synced pending action: ${action.type}`);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        // Increment retry count
        action.retryCount += 1;
        
        // Remove if too many retries
        if (action.retryCount > 3) {
          await this.removePendingAction(action.id);
          console.log(`Removed failed action after 3 retries: ${action.id}`);
        }
      }
    }
  }

  // Process individual pending action
  private async processPendingAction(action: PendingAction): Promise<void> {
    const { apiService } = await import('./api');

    switch (action.type) {
      case 'progress_update':
        await apiService.updateProgress(action.data.assignmentId, action.data.progress);
        break;
      
      case 'chore_completion':
        await apiService.completeChore(action.data.assignmentId, action.data.proofPhotoUrl);
        break;
      
      case 'reward_redemption':
        await apiService.redeemReward(action.data.rewardId);
        break;
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Check if cached data is still valid (24 hours)
  private isCacheValid(lastUpdated: number): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return Date.now() - lastUpdated < maxAge;
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Check online status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Register background sync if supported
  registerBackgroundSync(tag: string): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register(tag);
      }).catch(error => {
        console.warn('Background sync registration failed:', error);
      });
    }
  }
}

// Create singleton instance
export const offlineSyncService = new OfflineSyncService();

// Initialize when service loads
offlineSyncService.init().catch(console.error);

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Back online - syncing pending actions...');
  offlineSyncService.syncPendingActions();
});

window.addEventListener('offline', () => {
  console.log('Gone offline - actions will be queued for sync');
});

export default offlineSyncService;