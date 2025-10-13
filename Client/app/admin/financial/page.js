'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar,
  ArrowLeft, RefreshCw, Download, Upload, Plus, Edit, Trash2, Eye,
  CreditCard, Wallet, Receipt, FileText, Calculator, Banknote,
  AlertCircle, CheckCircle, X, Save, Settings, Filter, Search,
  Clock, Activity, Users, Package, Zap, Shield, Bell
} from 'lucide-react';

const FinancialManagementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Financial data state
  const [financialData, setFinancialData] = useState({
    overview: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      monthlyGrowth: 0,
      dailyRevenue: 0,
      pendingPayments: 0
    },
    transactions: [],
    invoices: [],
    reports: [],
    commissions: []
  });

  // Filters and search
  const [dateRange, setDateRange] = useState('month');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    checkAuth();
    loadFinancialData();
  }, [dateRange, currentPage, itemsPerPage]);

  const checkAuth = () => {
    const token = getAuthToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return;
    }
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Mock financial data
      const mockData = {
        overview: {
          totalRevenue: 125000,
          totalExpenses: 45000,
          netProfit: 80000,
          monthlyGrowth: 12.5,
          dailyRevenue: 4200,
          pendingPayments: 8500
        },
        transactions: [
          {
            id: 1,
            type: 'revenue',
            amount: 2500,
            description: 'Data purchase - MTN 1GB',
            date: new Date(),
            status: 'completed',
            customer: 'John Doe',
            method: 'wallet'
          },
          {
            id: 2,
            type: 'expense',
            amount: 150,
            description: 'API integration fee',
            date: new Date(Date.now() - 86400000),
            status: 'completed',
            vendor: 'Geonettech',
            method: 'bank_transfer'
          },
          {
            id: 3,
            type: 'commission',
            amount: 75,
            description: 'Agent commission - MTN 500MB',
            date: new Date(Date.now() - 172800000),
            status: 'pending',
            agent: 'Agent Smith',
            method: 'wallet'
          }
        ],
        invoices: [
          {
            id: 'INV-001',
            customer: 'ABC Company',
            amount: 5000,
            date: new Date(),
            dueDate: new Date(Date.now() + 7 * 86400000),
            status: 'pending',
            items: [
              { description: 'MTN Data Bundle', quantity: 100, price: 50 }
            ]
          }
        ],
        reports: [
          {
            id: 1,
            name: 'Monthly Revenue Report',
            type: 'revenue',
            period: 'January 2024',
            generated: new Date(),
            status: 'ready'
          }
        ],
        commissions: [
          {
            id: 1,
            agent: 'Agent Smith',
            totalSales: 15000,
            commissionRate: 5,
            commissionAmount: 750,
            period: 'January 2024',
            status: 'pending'
          }
        ]
      };

      setFinancialData(mockData);
      
    } catch (error) {
      console.error('Error loading financial data:', error);
      showNotification('Failed to load financial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    try {
      setLoading(true);
      showNotification(`${reportType} report generated successfully`);
      // In real implementation, this would generate actual reports
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialData = (format = 'csv') => {
    const data = financialData.transactions.map(t => ({
      'Date': new Date(t.date).toLocaleDateString(),
      'Type': t.type,
      'Amount': t.amount,
      'Description': t.description,
      'Status': t.status,
      'Method': t.method
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0]),
        ...data.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'commission': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Financial Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comprehensive financial tracking and reporting
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => exportFinancialData('csv')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
              
              <button
                onClick={loadFinancialData}
                disabled={loading}
                className="p-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'transactions', name: 'Transactions', icon: Receipt },
              { id: 'invoices', name: 'Invoices', icon: FileText },
              { id: 'commissions', name: 'Commissions', icon: Users },
              { id: 'reports', name: 'Reports', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(financialData.overview.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    +{financialData.overview.monthlyGrowth}% from last month
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(financialData.overview.totalExpenses)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 ml-1">
                    -5.2% from last month
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(financialData.overview.netProfit)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    +18.3% from last month
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(financialData.overview.dailyRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    +8.7% from yesterday
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-end justify-center space-x-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-green-500 rounded-t transition-all duration-300"
                        style={{ height: `${Math.random() * 200 + 50}px` }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(2024, i).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { category: 'API Costs', amount: 15000, color: 'bg-red-500' },
                    { category: 'Commissions', amount: 12000, color: 'bg-blue-500' },
                    { category: 'Infrastructure', amount: 8000, color: 'bg-green-500' },
                    { category: 'Marketing', amount: 5000, color: 'bg-purple-500' },
                    { category: 'Other', amount: 5000, color: 'bg-gray-500' }
                  ].map((expense, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${expense.color}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {expense.category}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {financialData.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'revenue' ? 'bg-green-500' : 
                        transaction.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'revenue' ? 'text-green-600' : 
                        transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                  <option value="commission">Commission</option>
                </select>
                
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transactions ({financialData.transactions.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {financialData.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h3>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financialData.invoices.map((invoice) => (
                <div key={invoice.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {invoice.id}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Customer:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Commissions</h3>
              <button
                onClick={() => setShowCommissionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Calculate Commissions</span>
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Commission Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Commission Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {financialData.commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {commission.agent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(commission.totalSales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {commission.commissionRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(commission.commissionAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {commission.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                            {commission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <CreditCard className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Reports</h3>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financialData.reports.map((report) => (
                <div key={report.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.name}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Period:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{report.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Generated:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(report.generated)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                      View
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}>
            <div className="flex items-center space-x-2">
              <span>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagementPage;
