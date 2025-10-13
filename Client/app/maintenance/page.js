'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, Users, AlertTriangle, RefreshCw, Home } from 'lucide-react';

const MaintenancePage = () => {
  const searchParams = useSearchParams();
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);

  const reason = searchParams.get('reason') || 'maintenance';
  const isDailyLimit = reason === 'daily_limit_reached';

  useEffect(() => {
    setMounted(true);
    
    // Update countdown every minute
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeDiff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset({ hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              {isDailyLimit ? (
                <Users className="w-12 h-12 text-white" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {isDailyLimit ? 'Daily Limit Reached' : 'Under Maintenance'}
            </h1>
            <p className="text-xl text-gray-300">
              {isDailyLimit 
                ? 'We\'ve reached our daily user limit of 10 million users'
                : 'We\'re currently performing maintenance to improve your experience'
              }
            </p>
          </div>

          {/* Status Info */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold text-white">Service Resumes In</span>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                {timeUntilReset.hours.toString().padStart(2, '0')}:
                {timeUntilReset.minutes.toString().padStart(2, '0')}
              </div>
              <p className="text-gray-300">Hours : Minutes</p>
            </div>
          </div>

          {/* Daily Limit Info */}
          {isDailyLimit && (
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 mb-8 border border-red-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-red-400" />
                <span className="text-lg font-semibold text-white">Daily Usage Limit</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Daily Limit:</span>
                  <span className="text-white font-semibold">10,000,000 users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-red-400 font-semibold">Limit Reached</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Reset Time:</span>
                  <span className="text-white font-semibold">Midnight UTC</span>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-gray-300 leading-relaxed">
              {isDailyLimit ? (
                <>
                  Thank you for your interest in our service! We've reached our daily capacity limit 
                  of 10 million users. Please check back tomorrow when our counters reset.
                  <br /><br />
                  This limit helps us maintain optimal performance and service quality for all users.
                </>
              ) : (
                <>
                  We're working hard to bring you an even better experience. 
                  Please check back soon for updates.
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Page</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20 flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              UnlimitedData GH • {new Date().getFullYear()}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Service will automatically resume at midnight UTC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
