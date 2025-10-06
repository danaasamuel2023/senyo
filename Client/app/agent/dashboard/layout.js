'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentDashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is an agent
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token) {
      router.push('/SignIn');
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== 'agent') {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/SignIn');
        return;
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
}
