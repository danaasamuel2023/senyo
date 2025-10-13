'use client';

import React, { useEffect } from 'react';
import { trackDailyUser } from '../utils/dailyUsageLimiter';

const DailyUsageTracker = () => {
  useEffect(() => {
    // Check if this page should track daily usage based on current path
    const currentPath = window.location.pathname;
    const shouldTrack = currentPath === '/' || currentPath === '/SignIn' || currentPath === '/SignUp';
    
    if (shouldTrack) {
      try {
        const userTracking = trackDailyUser();
        
        if (userTracking.isLimitReached) {
          console.warn('🚫 Daily user limit reached (10M users)');
          // Redirect to maintenance page
          window.location.href = '/maintenance?reason=daily_limit_reached';
          return;
        }
        
        // Log usage in development
        if (process.env.NODE_ENV === 'development' && userTracking.isNewUser) {
          console.log(`👤 Daily users: ${userTracking.dailyCount}/${10000000} (${userTracking.remainingUsers} remaining)`);
        }
      } catch (error) {
        console.error('Daily usage tracking error:', error);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default DailyUsageTracker;
