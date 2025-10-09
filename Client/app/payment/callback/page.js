import { Suspense } from 'react';
import PaymentCallbackClient from './PaymentCallbackClient';

export default function PaymentCallbackPage({ searchParams }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-800">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-blue-500 mb-4">Loading...</h1>
            <p className="text-gray-300">Please wait while we verify your payment.</p>
          </div>
        </div>
      </div>
    }>
      <PaymentCallbackClient searchParams={searchParams} />
    </Suspense>
  );
}