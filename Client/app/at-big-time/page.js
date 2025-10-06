'use client';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Clock, Sparkles } from 'lucide-react';

export default function ATBigTimePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-24 h-24 mx-auto">
            <Clock className="w-6 h-6 text-yellow-500 absolute top-4 right-4 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          AT Big Time
        </h1>
        
        {/* Status Badge */}
        <div className="inline-flex items-center px-3 py-1 bg-[#FFCC08]/20 text-[#FFCC08] rounded-full text-sm font-medium mb-4">
          <Clock className="w-3 h-3 mr-1.5" />
          Coming Soon
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're working hard to bring you something amazing! The AT Big Time service will be available soon with exclusive features and unbeatable deals.
        </p>

        {/* Features Preview */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Premium data packages</span>
          </div>
          <div className="flex items-center justify-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Sparkles className="w-5 h-5 text-pink-600 mr-3" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Exclusive discounts</span>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl font-semibold hover:from-yellow-500 hover:to-[#FFCC08] transition-all duration-300 shadow-lg shadow-yellow-500/25"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}