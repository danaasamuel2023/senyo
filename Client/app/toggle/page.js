// Inventory Management Page
'use client'
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  ToggleLeft, 
  ToggleRight,
  RefreshCw,
  Database,
  Activity,
  Clock
} from 'lucide-react';

export default function InventoryPage() {
  // Predefined networks
  const NETWORKS = ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"];
  
  const [inventoryStatus, setInventoryStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [authToken, setAuthToken] = useState('');

  // Get token from localStorage on component mount
  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      // Load current inventory status when token is available
      loadInventoryStatus(token);
    } else {
      setError('Authentication token not found. Please login first.');
    }
  }, []);

  // Load current inventory status from backend
  const loadInventoryStatus = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://datahustle.onrender.com/api/inventory',
        {
          method: 'GET',
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load inventory');
      }
      
      const data = await response.json();
      
      // Convert array to object for easier access
      const statusObj = {};
      data.inventory.forEach(item => {
        statusObj[item.network] = {
          inStock: item.inStock,
          skipGeonettech: item.skipGeonettech,
          updatedAt: item.updatedAt
        };
      });
      
      setInventoryStatus(statusObj);
    } catch (err) {
      console.error('Failed to load inventory status:', err);
      setError('Failed to load inventory status');
    } finally {
      setLoading(false);
    }
  };

  // Toggle inventory item status (in stock / out of stock)
  const toggleItemStatus = async (network) => {
    if (!authToken) {
      setError('Authentication token not found. Please login first.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://datahustle.onrender.com/api/inventory/${network}/toggle`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': authToken
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please login again.');
        }
        throw new Error('Failed to toggle status');
      }
      
      const data = await response.json();
      
      // Update the local state with the response
      setInventoryStatus(prev => ({
        ...prev,
        [network]: {
          ...prev[network],
          inStock: data.inStock,
          updatedAt: data.updatedAt || new Date().toISOString()
        }
      }));
      
      // Show success message
      setSuccessMessage(data.message || `${network} status toggled successfully`);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
      
    } catch (err) {
      setError(err.message || `Failed to toggle status for ${network}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Geonettech API for specific network
  const toggleGeonettechStatus = async (network) => {
    if (!authToken) {
      setError('Authentication token not found. Please login first.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://datahustle.onrender.com/api/inventory/${network}/toggle-geonettech`,
        {
          method: 'PUT',
          headers: {
            'x-auth-token': authToken
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please login again.');
        }
        throw new Error('Failed to toggle Geonettech API');
      }
      
      const data = await response.json();
      
      // Update the local state with the response
      setInventoryStatus(prev => ({
        ...prev,
        [network]: {
          ...prev[network],
          skipGeonettech: data.skipGeonettech,
          updatedAt: data.updatedAt || new Date().toISOString()
        }
      }));
      
      // Show success message
      setSuccessMessage(data.message || `${network} Geonettech API toggled successfully`);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
      
    } catch (err) {
      setError(err.message || `Failed to toggle Geonettech for ${network}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Package className="mr-3 h-8 w-8" />
                Network Inventory Management
              </h1>
              <p className="text-red-100 mt-2">Manage network availability and API settings</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Database className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start shadow-md">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-start shadow-md">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}
        
        {!authToken ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 flex items-start shadow-md">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">
                Authentication token not found. Please login to access inventory management.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Table Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                      <th className="py-4 px-6 text-left font-semibold">
                        <div className="flex items-center">
                          <Wifi className="mr-2 h-4 w-4" />
                          Network
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left font-semibold">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4" />
                          Stock Status
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left font-semibold">
                        <div className="flex items-center">
                          <Activity className="mr-2 h-4 w-4" />
                          Geonettech API
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left font-semibold">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Last Updated
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {NETWORKS.map((network, index) => {
                      const itemStatus = inventoryStatus[network] || { 
                        inStock: null, 
                        skipGeonettech: null,
                        updatedAt: null 
                      };
                      
                      return (
                        <tr key={network} className={`hover:bg-red-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-gray-800 flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              {network}
                            </span>
                          </td>
                          
                          {/* Stock Status Column */}
                          <td className="py-4 px-6">
                            {itemStatus.inStock === null ? (
                              <span className="text-gray-400 italic">Unknown</span>
                            ) : (
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                itemStatus.inStock 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {itemStatus.inStock ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    In Stock
                                  </>
                                ) : (
                                  <>
                                    <X className="mr-1 h-3 w-3" />
                                    Out of Stock
                                  </>
                                )}
                              </span>
                            )}
                          </td>
                          
                          {/* Geonettech API Status Column */}
                          <td className="py-4 px-6">
                            {itemStatus.skipGeonettech === null ? (
                              <span className="text-gray-400 italic">Unknown</span>
                            ) : (
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                itemStatus.skipGeonettech 
                                  ? 'bg-gray-100 text-gray-800 border border-gray-200' 
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {itemStatus.skipGeonettech ? (
                                  <>
                                    <ToggleLeft className="mr-1 h-3 w-3" />
                                    API Disabled
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="mr-1 h-3 w-3" />
                                    API Enabled
                                  </>
                                )}
                              </span>
                            )}
                          </td>
                          
                          {/* Last Updated Column */}
                          <td className="py-4 px-6">
                            <span className="text-gray-600 text-sm">
                              {itemStatus.updatedAt 
                                ? new Date(itemStatus.updatedAt).toLocaleString() 
                                : 'Never updated'}
                            </span>
                          </td>
                          
                          {/* Actions Column */}
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              {/* Toggle Stock Status Button */}
                              <button
                                onClick={() => toggleItemStatus(network)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all transform hover:scale-105 flex items-center ${
                                  loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
                                }`}
                              >
                                <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Processing...' : 'Toggle Stock'}
                              </button>
                              
                              {/* Toggle Geonettech API Button */}
                              <button
                                onClick={() => toggleGeonettechStatus(network)}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg text-red-600 text-sm font-medium transition-all transform hover:scale-105 flex items-center border-2 ${
                                  loading 
                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                    : 'bg-white border-red-500 hover:bg-red-50 shadow-md hover:shadow-lg'
                                }`}
                              >
                                <Activity className={`mr-1 h-3 w-3 ${loading ? 'animate-pulse' : ''}`} />
                                {loading ? 'Processing...' : 'Toggle API'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Legend Card */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-red-100">
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Status Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Package className="mr-2 h-4 w-4 text-red-600" />
                    Stock Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium border border-green-200 mr-3">
                        In Stock
                      </span>
                      <span className="text-gray-600">Available for purchase</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium border border-red-200 mr-3">
                        Out of Stock
                      </span>
                      <span className="text-gray-600">Not available for purchase</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Activity className="mr-2 h-4 w-4 text-red-600" />
                    Geonettech API
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200 mr-3">
                        API Enabled
                      </span>
                      <span className="text-gray-600">Orders processed automatically</span>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 mr-3">
                        API Disabled
                      </span>
                      <span className="text-gray-600">Orders marked as pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}