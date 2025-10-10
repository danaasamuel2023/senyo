'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Plus, Edit, Trash2, Search, RefreshCw, CheckCircle, XCircle, Package, TrendingUp, Sync, Eye, EyeOff } from 'lucide-react';

const PriceManagementPage = () => {
  const router = useRouter();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Networks
  const networks = [
    { value: 'MTN', label: 'MTN' },
    { value: 'YELLO', label: 'YELLO' },
    { value: 'VODAFONE', label: 'VODAFONE' },
    { value: 'TELECEL', label: 'TELECEL' },
    { value: 'AT_PREMIUM', label: 'AT PREMIUM' },
    { value: 'airteltigo', label: 'AirtelTigo' },
    { value: 'at', label: 'AT' }
  ];

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Load prices
  const loadPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/prices`, {
        headers: {
          'x-auth-token': localStorage.getItem('authToken')
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      setPrices(data.data || []);
    } catch (error) {
      console.error('Error loading prices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    loadPrices();
  }, []);

  // Get network color
  const getNetworkColor = (network) => {
    const colors = {
      'MTN': 'bg-yellow-100 text-yellow-800',
      'YELLO': 'bg-yellow-100 text-yellow-800',
      'VODAFONE': 'bg-red-100 text-red-800',
      'TELECEL': 'bg-purple-100 text-purple-800',
      'AT_PREMIUM': 'bg-blue-100 text-blue-800',
      'airteltigo': 'bg-green-100 text-green-800',
      'at': 'bg-blue-100 text-blue-800'
    };
    return colors[network] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-[#FFCC08]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Price Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage databundle prices and inventory
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadPrices}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Sync className="w-4 h-4 mr-2" />
                Sync DataMart
              </button>
              
              <button
                className="flex items-center px-4 py-2 bg-[#FFCC08] hover:bg-[#FFD700] text-black rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
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
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-2" />
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
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No prices found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    prices.map((price) => (
                      <tr key={price._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNetworkColor(price.network)}`}>
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
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enabled
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Disabled
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
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
