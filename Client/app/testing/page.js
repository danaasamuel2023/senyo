'use client';

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const TestingPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const runTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestResults([]);
    
    try {
      if (window.runTests) {
        const results = await window.runTests();
        setTestResults(results);
        setLastRun(new Date());
      } else {
        console.error('Test runner not available');
      }
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'FAIL':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automated Testing</h1>
              <p className="text-gray-600 mt-2">Run comprehensive tests for critical functionality</p>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>

          {lastRun && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Last run: {lastRun.toLocaleString()}
              </p>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-3 font-medium">{result.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.duration.toFixed(2)}ms
                  </div>
                </div>
                {result.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {result.error}
                  </div>
                )}
                {result.result && (
                  <div className="mt-2 text-sm text-gray-600">
                    Result: {JSON.stringify(result.result, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {testResults.length === 0 && !isRunning && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Play className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests run yet</h3>
              <p className="text-gray-600">Click "Run Tests" to start automated testing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestingPage;