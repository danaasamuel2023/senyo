// Daily Usage Limiter Utility
// Tracks and enforces daily user limits (10M users per day)

class DailyUsageLimiter {
  constructor() {
    this.maxDailyUsers = 10000000; // 10 million users per day
    this.storageKey = 'daily_usage_tracker';
    this.userTrackingKey = 'daily_users';
    this.resetTimeKey = 'daily_reset_time';
  }

  // Get current date string (YYYY-MM-DD)
  getCurrentDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // Check if we need to reset daily counters
  needsReset() {
    const lastResetDate = localStorage.getItem(this.resetTimeKey);
    const currentDate = this.getCurrentDateString();
    
    if (!lastResetDate || lastResetDate !== currentDate) {
      return true;
    }
    
    return false;
  }

  // Reset daily counters
  resetDailyCounters() {
    const currentDate = this.getCurrentDateString();
    localStorage.setItem(this.resetTimeKey, currentDate);
    localStorage.setItem(this.userTrackingKey, JSON.stringify([]));
    localStorage.setItem('daily_user_count', '0');
    
    console.log('🔄 Daily usage counters reset for:', currentDate);
  }

  // Get current daily user count
  getCurrentDailyUserCount() {
    if (this.needsReset()) {
      this.resetDailyCounters();
    }
    
    const count = localStorage.getItem('daily_user_count');
    return count ? parseInt(count) : 0;
  }

  // Track a new user visit
  trackUserVisit(userId = null) {
    if (this.needsReset()) {
      this.resetDailyCounters();
    }

    // Generate unique visitor ID if not provided
    const visitorId = userId || this.generateVisitorId();
    
    // Get existing users for today
    const existingUsers = JSON.parse(localStorage.getItem(this.userTrackingKey) || '[]');
    
    // Check if this user already visited today
    if (!existingUsers.includes(visitorId)) {
      existingUsers.push(visitorId);
      localStorage.setItem(this.userTrackingKey, JSON.stringify(existingUsers));
      localStorage.setItem('daily_user_count', existingUsers.length.toString());
      
      console.log(`👤 New daily user tracked. Total today: ${existingUsers.length}/${this.maxDailyUsers}`);
      
      return {
        isNewUser: true,
        dailyCount: existingUsers.length,
        remainingUsers: this.maxDailyUsers - existingUsers.length,
        isLimitReached: existingUsers.length >= this.maxDailyUsers
      };
    }
    
    return {
      isNewUser: false,
      dailyCount: existingUsers.length,
      remainingUsers: this.maxDailyUsers - existingUsers.length,
      isLimitReached: existingUsers.length >= this.maxDailyUsers
    };
  }

  // Generate unique visitor ID
  generateVisitorId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `visitor_${timestamp}_${random}`;
  }

  // Check if daily limit is reached
  isDailyLimitReached() {
    const currentCount = this.getCurrentDailyUserCount();
    return currentCount >= this.maxDailyUsers;
  }

  // Get usage statistics
  getUsageStats() {
    const currentCount = this.getCurrentDailyUserCount();
    const remainingUsers = this.maxDailyUsers - currentCount;
    const usagePercentage = (currentCount / this.maxDailyUsers) * 100;
    
    return {
      currentUsers: currentCount,
      maxUsers: this.maxDailyUsers,
      remainingUsers: remainingUsers,
      usagePercentage: usagePercentage.toFixed(2),
      isLimitReached: currentCount >= this.maxDailyUsers,
      resetDate: localStorage.getItem(this.resetTimeKey) || this.getCurrentDateString()
    };
  }

  // Get warning thresholds
  getWarningThresholds() {
    const stats = this.getUsageStats();
    
    return {
      warning: stats.usagePercentage >= 80, // 80% (8M users)
      critical: stats.usagePercentage >= 95, // 95% (9.5M users)
      limitReached: stats.isLimitReached
    };
  }

  // Format large numbers for display
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Get time until next reset
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeDiff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      hours,
      minutes,
      totalMinutes: Math.floor(timeDiff / (1000 * 60)),
      totalSeconds: Math.floor(timeDiff / 1000)
    };
  }
}

// Singleton instance
export const dailyUsageLimiter = new DailyUsageLimiter();

// Utility functions
export const trackDailyUser = (userId = null) => {
  return dailyUsageLimiter.trackUserVisit(userId);
};

export const getDailyUsageStats = () => {
  return dailyUsageLimiter.getUsageStats();
};

export const isDailyLimitReached = () => {
  return dailyUsageLimiter.isDailyLimitReached();
};

export const getDailyUsageWarnings = () => {
  return dailyUsageLimiter.getWarningThresholds();
};

export const getTimeUntilDailyReset = () => {
  return dailyUsageLimiter.getTimeUntilReset();
};

export default dailyUsageLimiter;
