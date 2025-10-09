'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-500/20 to-black/40 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/10 blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-red-500/30 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-red-100">You don't have permission to access this page</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Unauthorized Access</h2>
              <p className="text-gray-400 text-sm">
                This page requires special permissions that your account doesn't have.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 transition-all font-bold shadow-lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>

            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-400 mb-1">Need Help?</h4>
                  <p className="text-gray-400 text-xs">
                    If you believe this is an error, please contact support or check your account permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
