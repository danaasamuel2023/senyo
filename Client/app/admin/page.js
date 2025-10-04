'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-500 shadow-lg shadow-yellow-500/50 mb-6 animate-pulse">
          <RefreshCw className="w-8 h-8 text-black animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Redirecting to Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you to the admin dashboard...
        </p>
      </div>
    </div>
  );
}

