// src/components/SyncStatusBadge.tsx
// Displays current data synchronization status in the footer status rail.

import React from 'react';
import { SyncStatus } from '../types';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  pendingCount?: number;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ status, pendingCount = 0 }) => {
  if (status === 'synced') {
    return (
      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="hidden sm:inline">Synced</span>
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title={`${pendingCount} thay đổi đang chờ đồng bộ`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="hidden sm:inline">
          {pendingCount > 0 ? `Pending ${pendingCount}` : 'Syncing…'}
        </span>
      </span>
    );
  }

  // offline
  return (
    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500" title="Không có kết nối mạng — dữ liệu được lưu cục bộ">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      <span className="hidden sm:inline">Offline</span>
    </span>
  );
};
