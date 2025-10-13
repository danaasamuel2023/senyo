'use client';

import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { getDailyUsageStats, getDailyUsageWarnings, getTimeUntilDailyReset } from '../utils/dailyUsageLimiter';

const DailyUsageMonitor = () => {
  const [usageStats, setUsageStats] = useState(null);
  const [warnings, setWarnings] = useState(null);
  const [timeUntilReset, setTimeUntilReset] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    try {
      setUsageStats(getDailyUsageStats());
      setWarnings(getDailyUsageWarnings());
      setTimeUntilReset(getTimeUntilDailyReset());
    } catch (error) {
      console.error('Error updating daily usage stats:', error);
    }
  };

  if (!mounted || !usageStats || !warnings || !timeUntilReset) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (warnings.limitReached) return 'text-red-500';
    if (warnings.critical) return 'text-orange-500';
    if (warnings.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBg = () => {
    if (warnings.limitReached) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (warnings.critical) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (warnings.warning) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const getStatusText = () => {
    if (warnings.limitReached) return 'Limit Reached';
    if (warnings.critical) return 'Critical';
    if (warnings.warning) return 'Warning';
    return 'Normal';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Usage Monitor</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">10M user limit per day</p>
          </div>
        </div>
        
        <button
          onClick={updateStats}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Status Alert */}
      <div className={`p-4 rounded-xl border-l-4 mb-6 ${getStatusBg()}`}>
        <div className="flex items-center space-x-3">
          {warnings.limitReached ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <TrendingUp className="w-5 h-5 text-green-500" />
          )}
          <div>
            <span className={`font-semibold ${getStatusColor()}`}>
              Status: {getStatusText()}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {warnings.limitReached 
                ? 'Daily limit reached - Service unavailable'
                : warnings.critical
                ? 'Approaching daily limit - Monitor closely'
                : warnings.warning
                ? 'High usage detected - Watch for trends'
                : 'Usage within normal limits'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Users</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {usageStats.currentUsers.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Usage %</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {usageStats.usagePercentage}%
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {usageStats.remainingUsers.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Usage Progress</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {usageStats.currentUsers.toLocaleString()} / {usageStats.maxUsers.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              warnings.limitReached 
                ? 'bg-red-500' 
                : warnings.critical 
                ? 'bg-orange-500' 
                : warnings.warning 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usageStats.usagePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Reset Timer */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3 mb-3">
          <Clock className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900 dark:text-white">Next Reset</span>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {timeUntilReset.hours.toString().padStart(2, '0')}:
            {timeUntilReset.minutes.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hours : Minutes until midnight UTC
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Reset Date:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {usageStats.resetDate}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Max Daily Users:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              10,000,000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyUsageMonitor;
