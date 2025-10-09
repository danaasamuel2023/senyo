'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export default function TestPaymentPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Test cases
  const testCases = [
    {
      id: 'valid-reference',
      name: 'Valid Payment Reference',
      reference: 'T1234567890',
      description: 'Test with a valid payment reference format'
    },
    {
      id: 'invalid-reference',
      name: 'Invalid Payment Reference',
      reference: 'invalid_ref',
      description: 'Test with an invalid payment reference'
    },
    {
      id: 'empty-reference',
      name: 'Empty Payment Reference',
      reference: '',
      description: 'Test with empty payment reference'
    },
    {
      id: 'malformed-reference',
      name: 'Malformed Payment Reference',
      reference: 'ref@#$%^&*()',
      description: 'Test with malformed payment reference'
    }
  ];

  // Test payment verification
  const testPaymentVerification = async (testCase) => {
    try {
      setCurrentTest(`Testing ${testCase.name}...`);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
      const url = `${API_URL}/api/v1/verify-payment?reference=${encodeURIComponent(testCase.reference)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Senyo-Payment-Test/1.0',
        },
      });

      const data = await response.json();
      
      return {
        ...testCase,
        status: response.status,
        success: response.ok,
        data: data,
        error: null
      };
    } catch (error) {
      return {
        ...testCase,
        status: 500,
        success: false,
        data: null,
        error: error.message
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results = [];
    
    for (const testCase of testCases) {
      const result = await testPaymentVerification(testCase);
      results.push(result);
      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  // Run single test
  const runSingleTest = async (testCase) => {
    setIsRunning(true);
    setCurrentTest(`Testing ${testCase.name}...`);
    
    const result = await testPaymentVerification(testCase);
    setTestResults([result]);
    
    setIsRunning(false);
    setCurrentTest('');
  };

  // Clear results
  const clearResults = () => {
    setTestResults([]);
    setCurrentTest('');
  };

  // Get status icon
  const getStatusIcon = (result) => {
    if (result.error) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else if (result.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  // Get status color
  const getStatusColor = (result) => {
    if (result.error) {
      return 'border-red-500 bg-red-50';
    } else if (result.success) {
      return 'border-green-500 bg-green-50';
    } else {
      return 'border-yellow-500 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payment System Test Suite</h1>
          <p className="text-gray-400">Test your Paystack payment verification system</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-[#FFD700] text-black font-bold rounded-xl hover:from-[#FFD700] hover:to-[#FFCC08] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>Run All Tests</span>
            </button>

            <button
              onClick={clearResults}
              disabled={isRunning}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Clear Results</span>
            </button>

            <div className="flex-1" />
            
            <div className="text-sm text-gray-400">
              API URL: {process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com'}
            </div>
          </div>

          {currentTest && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-blue-200">{currentTest}</span>
              </div>
            </div>
          )}
        </div>

        {/* Test Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {testCases.map((testCase) => (
            <div key={testCase.id} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{testCase.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{testCase.description}</p>
                  <div className="text-xs text-gray-500 font-mono bg-gray-900/50 p-2 rounded">
                    Reference: {testCase.reference || '(empty)'}
                  </div>
                </div>
                <button
                  onClick={() => runSingleTest(testCase)}
                  disabled={isRunning}
                  className="px-4 py-2 bg-[#FFCC08] text-black font-semibold rounded-lg hover:bg-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Test Results</h2>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-xl p-4 ${getStatusColor(result)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600">{result.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-gray-600">
                        Status: {result.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                  </div>

                  {result.error && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-800">
                        <strong>Error:</strong> {result.error}
                      </div>
                    </div>
                  )}

                  {result.data && (
                    <div className="mt-3 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-800">
                        <strong>Response:</strong>
                        <pre className="mt-2 text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Testing Instructions</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Development Testing</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Ensure your backend server is running on localhost:5001</li>
                <li>Run the tests to verify API endpoints are working</li>
                <li>Check browser console for detailed logs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">2. Production Testing</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Update the API URL in your environment variables</li>
                <li>Test with real payment references from Paystack</li>
                <li>Monitor server logs for any issues</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3. Paystack Dashboard</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Set callback URL to: https://yourdomain.com/payment/callback</li>
                <li>Set webhook URL to: https://unlimitedata.onrender.com/api/v1/paystack/webhook</li>
                <li>Test webhook delivery in Paystack dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
