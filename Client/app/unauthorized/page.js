'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-400/20 to-red-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-400/20 to-black/40 blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-red-400/30 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-red-500 p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center shadow-xl">
                  <AlertTriangle className="w-8 h-8 text-red-400" strokeWidth={2} />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-1">Access Denied</h1>
              <p className="text-white text-sm font-medium">Insufficient Permissions</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Unauthorized Access</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                You don't have the required permissions to access this page. 
                Please contact an administrator if you believe this is an error.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black transition-all duration-300 font-bold"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl backdrop-blur-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-lg bg-red-500/30 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-400 mb-2">Security Notice</h4>
                  <div className="space-y-1 text-white text-xs font-medium">
                    <p>• This page is protected by role-based access control</p>
                    <p>• Only authorized users can access this content</p>
                    <p>• Contact support if you need access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}