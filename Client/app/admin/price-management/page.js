'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PriceManagementPage = () => {
  const router = useRouter();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL - Connected to production
  const API_URL = 'https://unlimitedata.onrender.com';

  // Load prices
  const loadPrices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        router.push('/SignIn');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/admin/prices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch prices: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Prices loaded from production API:', data);
      setPrices(data.data || []);
    } catch (error) {
      console.error('Error loading prices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test API connection
  const testConnection = async () => {
    try {
      console.log('🔗 Testing connection to production API...');
      const response = await fetch(`${API_URL}/api/v1/admin/prices`, {
        method: 'HEAD', // Just test if endpoint exists
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      
      if (response.ok) {
        console.log('✅ Production API connection successful');
      } else {
        console.log('⚠️ Production API responded with:', response.status);
      }
    } catch (error) {
      console.error('❌ Production API connection failed:', error);
    }
  };

  // Initialize
  useEffect(() => {
    testConnection();
    loadPrices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#FFCC08] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">⚙</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Price Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage databundle prices and inventory
                </p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                    Connected to Production API
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadPrices}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="mr-2">🔄</span>
                Sync DataMart
              </button>
              
              <button
                className="flex items-center px-4 py-2 bg-[#FFCC08] hover:bg-[#FFD700] text-black rounded-lg transition-colors"
              >
                <span className="mr-2">➕</span>
                Add Price
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading prices...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {prices.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="w-12 h-12 mx-auto mb-4 text-gray-300 text-4xl">📦</div>
                          <p>No prices found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    prices.map((price) => (
                      <tr key={price._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            price.network === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                            price.network === 'VODAFONE' ? 'bg-red-100 text-red-800' :
                            price.network === 'TELECEL' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {price.network}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {price.capacity}GB
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          ₵{price.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            price.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {price.enabled ? (
                              <>
                                <span className="mr-1">✅</span>
                                Enabled
                              </>
                            ) : (
                              <>
                                <span className="mr-1">❌</span>
                                Disabled
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              ✏️
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceManagementPage;