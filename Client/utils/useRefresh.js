'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for handling refresh functionality
 * Provides different types of refresh methods for various use cases
 */
export const useRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  /**
   * Refresh the current page data (Next.js router refresh)
   * This refreshes the page content without full page reload
   */
  const refreshPage = useCallback(() => {
    router.refresh();
  }, [router]);

  /**
   * Refresh data using a custom function
   * Useful for refreshing specific data like user lists, orders, etc.
   */
  const refreshData = useCallback(async (refreshFunction) => {
    if (!refreshFunction || typeof refreshFunction !== 'function') {
      console.warn('useRefresh: refreshFunction must be a valid function');
      return;
    }

    setIsRefreshing(true);
    try {
      await refreshFunction();
    } catch (error) {
      console.error('Refresh failed:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Hard refresh - full page reload
   * Use this when you need to completely reload the page
   */
  const hardRefresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  /**
   * Refresh with cache busting
   * Forces a fresh fetch from the server
   */
  const refreshWithCacheBust = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('_t', Date.now().toString());
      window.location.href = url.toString();
    }
  }, []);

  /**
   * Smart refresh - tries different methods based on context
   */
  const smartRefresh = useCallback(async (refreshFunction) => {
    try {
      // First try to refresh data if function provided
      if (refreshFunction) {
        await refreshData(refreshFunction);
        return;
      }
      
      // Fallback to page refresh
      refreshPage();
    } catch (error) {
      console.error('Smart refresh failed, falling back to hard refresh:', error);
      // If all else fails, do a hard refresh
      hardRefresh();
    }
  }, [refreshData, refreshPage, hardRefresh]);

  return {
    isRefreshing,
    refreshPage,
    refreshData,
    hardRefresh,
    refreshWithCacheBust,
    smartRefresh
  };
};

/**
 * Hook specifically for pull-to-refresh functionality
 * Provides enhanced refresh capabilities with loading states
 */
export const usePullToRefresh = (refreshFunction) => {
  const { isRefreshing, refreshData, smartRefresh } = useRefresh();

  const handlePullRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      if (refreshFunction) {
        await refreshData(refreshFunction);
      } else {
        await smartRefresh();
      }
    } catch (error) {
      console.error('Pull to refresh failed:', error);
      // Don't throw error to prevent UI from breaking
      // The error is already logged above
    }
  }, [isRefreshing, refreshData, smartRefresh, refreshFunction]);

  return {
    isRefreshing,
    handlePullRefresh
  };
};

/**
 * Hook for page-specific refresh functionality
 * Automatically detects the current page and provides appropriate refresh methods
 */
export const usePageRefresh = () => {
  const { isRefreshing, refreshData, hardRefresh } = useRefresh();

  const getPageRefreshFunction = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const pathname = window.location.pathname;
    
    // Define page-specific refresh functions
    const pageRefreshFunctions = {
      '/': () => {
        // Home page - refresh user dashboard data
        const event = new CustomEvent('refreshDashboard');
        window.dispatchEvent(event);
      },
      '/myorders': () => {
        // Orders page - refresh orders list
        const event = new CustomEvent('refreshOrders');
        window.dispatchEvent(event);
      },
      '/admin/dashboard': () => {
        // Admin dashboard - refresh admin data
        const event = new CustomEvent('refreshAdminDashboard');
        window.dispatchEvent(event);
      },
      '/admin/users': () => {
        // Admin users - refresh users list
        const event = new CustomEvent('refreshUsers');
        window.dispatchEvent(event);
      },
      '/profile': () => {
        // Profile page - refresh user profile
        const event = new CustomEvent('refreshProfile');
        window.dispatchEvent(event);
      }
    };

    return pageRefreshFunctions[pathname] || null;
  }, []);

  const refreshCurrentPage = useCallback(async () => {
    const refreshFunction = getPageRefreshFunction();
    
    if (refreshFunction) {
      await refreshData(refreshFunction);
    } else {
      // Fallback to hard refresh for unknown pages
      hardRefresh();
    }
  }, [getPageRefreshFunction, refreshData, hardRefresh]);

  return {
    isRefreshing,
    refreshCurrentPage,
    getPageRefreshFunction
  };
};
