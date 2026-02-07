import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SyncStatus } from '@/lib/offlineSync';

interface OfflineStatusProps {
  syncManager: any; // OfflineSyncManager
  className?: string;
}

/**
 * Component to display offline/sync status
 * Shows:
 * - Online/Offline indicator
 * - Pending sync items count
 * - Sync progress
 */
export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  syncManager,
  className = '',
}) => {
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    if (!syncManager) return;

    // Get initial status
    setStatus(syncManager.getStatus());

    // Subscribe to status changes
    const unsubscribe = syncManager.subscribe((newStatus: SyncStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [syncManager]);

  if (!status) return null;

  // Don't show anything if online and no pending items
  if (status.isOnline && status.pendingCount === 0 && !status.isSyncing) {
    return null;
  }

  return (
    <div className={className}>
      {!status.isOnline && (
        <Alert variant="destructive" className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are offline. Changes will be synced when you're back online.
            {status.pendingCount > 0 && ` (${status.pendingCount} pending)`}
          </AlertDescription>
        </Alert>
      )}

      {status.isSyncing && (
        <Alert className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Syncing offline changes...</AlertDescription>
        </Alert>
      )}

      {status.isOnline && status.pendingCount > 0 && !status.isSyncing && (
        <Alert className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription>
            {status.pendingCount} change{status.pendingCount !== 1 ? 's' : ''} synced
          </AlertDescription>
        </Alert>
      )}

      {status.isOnline && status.pendingCount === 0 && (
        <Alert className="flex items-center gap-2 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">All changes synced</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OfflineStatus;
