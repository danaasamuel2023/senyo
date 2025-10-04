'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  FileText, Download, Calendar, Filter, RefreshCw, ArrowLeft,
  TrendingUp, Users, Package, DollarSign, BarChart3, PieChart,
  CheckCircle, AlertCircle, X, Eye, Search, FileSpreadsheet,
  Printer, Mail, Share2, Clock, Activity
} from 'lucide-react';

const ReportsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    checkAuth();
    generateReport();
  }, [reportType, dateRange]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || user.role !== 'admin') {
      router.push('/SignIn');
      return false;
    }
    return true;
  };

  const generateReport = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const [stats, orders, transactions, users] = await Promise.all([
        adminAPI.dashboard.getStatistics(),
        adminAPI.order.getOrders({ 
          startDate: dateRange.start, 
          endDate: dateRange.end,
          limit: 1000
        }),
        adminAPI.transaction.getTransactions({ 
          startDate: dateRange.start, 
          endDate: dateRange.end,
          limit: 1000
        }),
        adminAPI.user.getUsers(1, 1000)
      ]);

      // Process data based on report type
      let processedData = {};
      
      switch (reportType) {
        case 'sales':
          processedData = processSalesReport(orders, stats);
          break;
        case 'financial':
          processedData = processFinancialReport(transactions, orders);
          break;
        case 'users':
          processedData = processUsersReport(users);
          break;
        case 'products':
          processedData = processProductsReport(orders);
          break;
        case 'agents':
          processedData = processAgentsReport(users);
          break;
      }
      
      setReportData(processedData);
    } catch (error) {
      console.error('Failed to generate report:', error);
      showNotification('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processSalesReport = (ordersData, stats) => {
    const orders = ordersData.orders || [];
    return {
      summary: {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        failedOrders: orders.filter(o => o.status === 'failed').length,
        totalRevenue: ordersData.totalRevenue || 0
      },
      byNetwork: groupByNetwork(orders),
      byDay: groupByDay(orders),
      topCustomers: getTopCustomers(orders)
    };
  };

  const processFinancialReport = (transactionsData, ordersData) => {
    const transactions = transactionsData.transactions || [];
    return {
      summary: {
        totalTransactions: transactions.length,
        totalDeposits: transactionsData.amountByType?.deposit || 0,
        totalPayments: transactionsData.amountByType?.payment || 0,
        totalRefunds: transactionsData.amountByType?.refund || 0,
        netRevenue: (transactionsData.amountByType?.deposit || 0) - (transactionsData.amountByType?.refund || 0)
      },
      byGateway: groupByGateway(transactions),
      byType: transactionsData.amountByType || {}
    };
  };

  const processUsersReport = (usersData) => {
    const users = usersData.users || [];
    return {
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter(u => !u.isDisabled).length,
        byRole: {
          admin: users.filter(u => u.role === 'admin').length,
          agent: users.filter(u => u.role === 'agent').length,
          buyer: users.filter(u => u.role === 'buyer').length,
          seller: users.filter(u => u.role === 'seller').length,
          dealer: users.filter(u => u.role === 'Dealer').length
        }
      },
      growthData: []
    };
  };

  const processProductsReport = (ordersData) => {
    const orders = ordersData.orders || [];
    const productStats = {};
    
    orders.forEach(order => {
      const key = `${order.network}_${order.capacity}GB`;
      if (!productStats[key]) {
        productStats[key] = {
          network: order.network,
          capacity: order.capacity,
          count: 0,
          revenue: 0
        };
      }
      productStats[key].count++;
      productStats[key].revenue += order.price;
    });
    
    return {
      products: Object.values(productStats).sort((a, b) => b.count - a.count),
      totalProducts: Object.keys(productStats).length
    };
  };

  const processAgentsReport = (usersData) => {
    const agents = usersData.users?.filter(u => u.role === 'agent') || [];
    return {
      summary: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.agentMetadata?.agentStatus === 'active').length,
        pendingAgents: agents.filter(a => a.agentMetadata?.agentStatus === 'pending').length,
        totalCommissions: agents.reduce((sum, a) => sum + (a.agentMetadata?.totalCommissions || 0), 0)
      },
      topAgents: agents.sort((a, b) => 
        (b.agentMetadata?.totalCommissions || 0) - (a.agentMetadata?.totalCommissions || 0)
      ).slice(0, 10)
    };
  };

  const groupByNetwork = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      if (!grouped[order.network]) {
        grouped[order.network] = { count: 0, revenue: 0 };
      }
      grouped[order.network].count++;
      if (order.status === 'completed') {
        grouped[order.network].revenue += order.price;
      }
    });
    return grouped;
  };

  const groupByDay = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      const day = new Date(order.createdAt).toISOString().split('T')[0];
      if (!grouped[day]) {
        grouped[day] = { count: 0, revenue: 0 };
      }
      grouped[day].count++;
      if (order.status === 'completed') {
        grouped[day].revenue += order.price;
      }
    });
    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  };

  const groupByGateway = (transactions) => {
    const grouped = {};
    transactions.forEach(tx => {
      if (!grouped[tx.gateway]) {
        grouped[tx.gateway] = { count: 0, amount: 0 };
      }
      grouped[tx.gateway].count++;
      if (tx.status === 'completed') {
        grouped[tx.gateway].amount += tx.amount;
      }
    });
    return grouped;
  };

  const getTopCustomers = (orders) => {
    const customers = {};
    orders.forEach(order => {
      const userId = order.userId?._id || order.userId;
      if (!customers[userId]) {
        customers[userId] = {
          name: order.userId?.name || 'Unknown',
          email: order.userId?.email,
          count: 0,
          revenue: 0
        };
      }
      customers[userId].count++;
      if (order.status === 'completed') {
        customers[userId].revenue += order.price;
      }
    });
    return Object.values(customers).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csv = '';
    const filename = `${reportType}_report_${dateRange.start}_to_${dateRange.end}.csv`;
    
    // Generate CSV based on report type
    switch (reportType) {
      case 'sales':
        csv = generateSalesCSV(reportData);
        break;
      case 'financial':
        csv = generateFinancialCSV(reportData);
        break;
      case 'users':
        csv = generateUsersCSV(reportData);
        break;
      case 'products':
        csv = generateProductsCSV(reportData);
        break;
      case 'agents':
        csv = generateAgentsCSV(reportData);
        break;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Report exported successfully', 'success');
  };

  const generateSalesCSV = (data) => {
    let csv = 'Date,Orders,Revenue\n';
    data.byDay.forEach(day => {
      csv += `${day.date},${day.count},${day.revenue.toFixed(2)}\n`;
    });
    return csv;
  };

  const generateFinancialCSV = (data) => {
    let csv = 'Type,Amount\n';
    Object.entries(data.byType).forEach(([type, amount]) => {
      csv += `${type},${amount.toFixed(2)}\n`;
    });
    return csv;
  };

  const generateUsersCSV = (data) => {
    let csv = 'Role,Count\n';
    Object.entries(data.summary.byRole).forEach(([role, count]) => {
      csv += `${role},${count}\n`;
    });
    return csv;
  };

  const generateProductsCSV = (data) => {
    let csv = 'Network,Capacity,Orders,Revenue\n';
    data.products.forEach(product => {
      csv += `${product.network},${product.capacity}GB,${product.count},${product.revenue.toFixed(2)}\n`;
    });
    return csv;
  };

  const generateAgentsCSV = (data) => {
    let csv = 'Agent Name,Commission,Status\n';
    data.topAgents.forEach(agent => {
      csv += `${agent.name},${agent.agentMetadata?.totalCommissions || 0},${agent.agentMetadata?.agentStatus || 'N/A'}\n`;
    });
    return csv;
  };

  const printReport = () => {
    window.print();
    showNotification('Opening print dialog', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and export business reports</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={printReport}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center space-x-2"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={generateReport}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              >
                <option value="sales">Sales Report</option>
                <option value="financial">Financial Report</option>
                <option value="users">Users Report</option>
                <option value="products">Products Report</option>
                <option value="agents">Agents Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-12 h-12 text-[#FFCC08] animate-spin" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Sales Report */}
          {reportType === 'sales' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.summary.totalOrders}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Completed</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.summary.completedOrders}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Pending</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.summary.pendingOrders}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Revenue</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    GHS {reportData.summary.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              {/* Network Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales by Network</h3>
                <div className="space-y-3">
                  {Object.entries(reportData.byNetwork).map(([network, data]) => (
                    <div key={network}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{network}</span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {data.count} orders • GHS {data.revenue.toFixed(2)}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-[#FFCC08] h-2 rounded-full transition-all"
                          style={{ width: `${(data.count / reportData.summary.totalOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Financial Report */}
          {reportType === 'financial' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-green-500">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Deposits</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    GHS {reportData.summary.totalDeposits.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-blue-500">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Payments</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    GHS {reportData.summary.totalPayments.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Refunds</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    GHS {reportData.summary.totalRefunds.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 border-purple-500">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Net Revenue</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    GHS {reportData.summary.netRevenue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Payment Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(reportData.byGateway).map(([gateway, data]) => (
                    <div key={gateway} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{gateway}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        GHS {data.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{data.count} transactions</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Users Report */}
          {reportType === 'users' && reportData.summary && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Users by Role</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(reportData.summary.byRole).map(([role, count]) => (
                  <div key={role} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Report */}
          {reportType === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Orders</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.products.map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                          {product.network} {product.capacity}GB
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          {product.count}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                          GHS {product.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Agents Report */}
          {reportType === 'agents' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Agents</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.summary.totalAgents}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <Activity className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Active Agents</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.summary.activeAgents}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <Clock className="w-8 h-8 text-yellow-600 mb-2" />
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Pending</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {reportData.summary.pendingAgents}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Commissions</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    GHS {reportData.summary.totalCommissions.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Agents</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Agent</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Commission</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topAgents.map((agent, index) => (
                        <tr key={agent._id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-4 px-6">
                            <div className="w-8 h-8 bg-[#FFCC08] rounded-full flex items-center justify-center text-black font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                            GHS {agent.agentMetadata?.totalCommissions?.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              agent.agentMetadata?.agentStatus === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {agent.agentMetadata?.agentStatus || 'pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select a date range and report type to generate
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
