'use client';

import { useCallback } from 'react';
import { usePageRefresh } from '@/utils/useRefresh';
import PullToRefresh from './PullToRefresh';

const PullToRefreshWrapper = ({ children }) => {
  const { isRefreshing, refreshCurrentPage } = usePageRefresh();

  const handleRefresh = useCallback(async () => {
    try {
      await refreshCurrentPage();
    } catch (error) {
      console.error('Page refresh failed:', error);
      // Fallback to hard refresh if page-specific refresh fails
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }, [refreshCurrentPage]);

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      disabled={isRefreshing}
      pullText="Pull to refresh"
      releaseText="Release to refresh"
      refreshingText="Refreshing..."
    >
      {children}
    </PullToRefresh>
  );
};

export default PullToRefreshWrapper;
