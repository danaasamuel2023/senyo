'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import { getNextPublicApiUrl } from '../../../utils/envConfig';
import { 
  User, Users, BarChart3, Package, Clock, CreditCard, FileText, Settings, 
  Search, Calendar, DollarSign, TrendingUp, LogOut, Sun, Moon, Menu, X, 
  ChevronRight, AlertCircle, CheckCircle, RefreshCw, Plus, Filter, Download, 
  Upload, Edit, Trash2, Eye, Database, Shield, Activity, PieChart, ArrowUp, 
  ArrowDown, Bell, HelpCircle, Save, XCircle, Home, ShoppingCart, Wallet,
  UserCheck, UserX, Package2, Truck, AlertTriangle, ChevronDown, MoreVertical,
  Copy, ExternalLink, Mail, Phone, MapPin, Building, Hash, Star, Zap, Briefcase, Store, MessageSquare
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SkeletonDashboard, SkeletonTable, SkeletonList } from '../../../component/SkeletonLoaders';
import { EmptyOrders, EmptyUsers, EmptyError } from '../../../component/EmptyStates';

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    growthRate: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalCommissions: 0,
    todayRevenue: 0,
    todayOrders: 0,
    systemHealth: 'excellent'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

  // API Configuration
  const API_BASE_URL = getNextPublicApiUrl();
  
  // Debug mode for development
  const DEBUG_MODE = process.env.NODE_ENV === 'development';
  
  // Cache for performance
  const [dataCache, setDataCache] = useState({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Initialize sidebar state based on screen size with better mobile detection
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        // Better mobile detection using multiple methods
        const width = window.innerWidth;
        const isMobile = width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isDesktopView = !isMobile;
        
        setIsDesktop(isDesktopView);
        // Only auto-open sidebar on desktop, keep mobile closed by default
        if (isDesktopView) {
          setSidebarOpen(true);
        } else {
          setSidebarOpen(false);
        }
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener with debouncing for better performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
      // Also listen for orientation changes on mobile
      window.addEventListener('orientationchange', debouncedResize);
    }
    
    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('orientationchange', debouncedResize);
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Update time and date on client side only
  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };

    // Update immediately
    updateTime();
    
    // Update every 10 seconds for faster time updates
    const interval = setInterval(updateTime, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Check authentication with better mobile support
  const checkAuth = useCallback(() => {
    try {
      // Use the same token verification as SignIn page with mobile-friendly error handling
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const userDataStr = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      
      // Better error handling for mobile browsers
      if (!token) {
        console.warn('No auth token found - redirecting to login');
        router.push('/admin/login');
        return;
      }
      
      if (!userDataStr) {
        console.warn('No user data found - redirecting to login');
        router.push('/admin/login');
        return;
      }
      
      // Parse user data with error handling
      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/admin/login');
        return;
      }
      
      // Check if user has admin role
      if (!userData.role || !['admin', 'superadmin'].includes(userData.role)) {
        console.warn('User does not have admin privileges');
        router.push('/admin/login');
        return;
      }
      
      setUserData(userData);
      setIsAuthenticated(true);
      setAuthChecked(true);
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setAuthChecked(true);
      router.push('/admin/login');
    }
  }, [router]);

  // Retry function with exponential backoff
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (error.message.includes('Too many requests') && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limited, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const cacheKey = 'dashboard_stats';
      const now = Date.now();
      
      // Check cache first
      if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp < CACHE_DURATION)) {
        setStats(dataCache[cacheKey].data);
        return;
      }

      // Check if we have a valid token before making API calls
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        console.warn('No authentication token found, redirecting to login');
        router.push('/admin/login');
        return;
      }

      if (DEBUG_MODE) {
        console.log('Loading dashboard statistics...');
        console.log('API Base URL:', API_BASE_URL);
        console.log('Auth Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      }
      
      // Fetch in parallel for speed with retry mechanism
      const [dashboardStats, todaySummary] = await Promise.all([
        retryWithBackoff(() => adminAPI.dashboard.getStatistics()).catch(err => {
          console.error('Dashboard stats API error:', err.message);
          if (err.message.includes('Authentication required')) {
            showNotification('Please sign in again', 'error');
            router.push('/admin/login');
            return { success: false, data: null };
          }
          showNotification(`Failed to load dashboard statistics: ${err.message}`, 'error');
          // Return empty data structure instead of mock data
          return {
            success: false,
            data: {
              overview: {
                totalUsers: 0,
                totalOrders: 0,
                todayOrders: 0,
                todayRevenue: 0
              }
            }
          };
        }),
        retryWithBackoff(() => adminAPI.dashboard.getDailySummary(new Date().toISOString().split('T')[0])).catch(err => {
          console.error('Daily summary API error:', err.message);
          if (err.message.includes('Authentication required')) {
            showNotification('Please sign in again', 'error');
            router.push('/admin/login');
            return { success: false, data: null };
          }
          showNotification(`Failed to load daily summary: ${err.message}`, 'error');
          // Return empty data structure instead of mock data
          return {
            success: false,
            data: {
              summary: { totalOrders: 0, totalRevenue: 0, totalDeposits: 0 },
              networkBreakdown: []
            }
          };
        })
      ]);
      
      // Check if authentication failed
      if (dashboardStats.data === null || todaySummary.data === null) {
        console.warn('Authentication failed, redirecting to login');
        return;
      }

      // Process real API data
      const statsData = {
        totalUsers: dashboardStats.success ? (dashboardStats.data?.overview?.totalUsers || 0) : 0,
        activeUsers: dashboardStats.success ? Math.floor((dashboardStats.data?.overview?.totalUsers || 0) * 0.6) : 0,
        totalOrders: dashboardStats.success ? (dashboardStats.data?.overview?.totalOrders || 0) : 0,
        totalRevenue: dashboardStats.success ? (dashboardStats.data?.overview?.todayRevenue || 0) : 0,
        growthRate: 12.5, // This would come from a separate API call for growth calculation
        pendingOrders: 0, // This would come from order status breakdown
        completedOrders: 0, // This would come from order status breakdown
        totalProducts: todaySummary.success ? (todaySummary.data?.networkBreakdown?.length || 0) : 0,
        todayOrders: dashboardStats.success ? (dashboardStats.data?.overview?.todayOrders || 0) : 0,
        todayRevenue: dashboardStats.success ? (dashboardStats.data?.overview?.todayRevenue || 0) : 0,
        systemHealth: dashboardStats.success && todaySummary.success ? 'excellent' : 'error'
      };
      
      console.log('Dashboard stats loaded:', statsData);
      setStats(statsData);
      
      // Cache the data
      setDataCache(prev => ({
        ...prev,
        [cacheKey]: { data: statsData, timestamp: now }
      }));
      
      // Show success notification if data was loaded successfully
      if (dashboardStats.success || todaySummary.success) {
        showNotification('Dashboard data refreshed successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      showNotification('Failed to load dashboard statistics', 'error');
      
      // Set empty stats on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        growthRate: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalProducts: 0,
        totalAgents: 0,
        activeAgents: 0,
        totalCommissions: 0,
        todayRevenue: 0,
        todayOrders: 0,
        systemHealth: 'error'
      });
    }
  }, [dataCache, CACHE_DURATION, router]);

  // Helper function to get time ago
  const getTimeAgo = useCallback((date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  }, []);

  // Load recent activities
  const loadRecentActivities = useCallback(async () => {
    try {
      const [ordersData, transactionsData] = await Promise.all([
        adminAPI.order.getOrders({ limit: 5 }).catch(() => ({ orders: [] })),
        adminAPI.transaction.getTransactions({ limit: 5 }).catch(() => ({ transactions: [] }))
      ]);

      const activities = [];
      
      // Add order activities
      if (ordersData.orders) {
        ordersData.orders.forEach(order => {
          const timeAgo = getTimeAgo(new Date(order.createdAt));
          activities.push({
            id: `order-${order._id}`,
            type: 'order',
            message: `Order #${order.geonetReference || order._id.slice(-6)} - ${order.network} ${order.capacity}GB`,
            time: timeAgo,
            icon: order.status === 'completed' ? Truck : ShoppingCart
          });
        });
      }

      // Add transaction activities
      if (transactionsData.transactions) {
        transactionsData.transactions.forEach(transaction => {
          const timeAgo = getTimeAgo(new Date(transaction.createdAt));
          if (transaction.type === 'deposit' && transaction.status === 'completed') {
            activities.push({
              id: `trans-${transaction._id}`,
              type: 'payment',
              message: `Payment received: GHS ${transaction.amount}`,
              time: timeAgo,
              icon: CreditCard
            });
          }
        });
      }

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to load activities:', error);
      setRecentActivities([]);
    }
  }, [getTimeAgo]);

  // Load chart data
  const loadChartData = useCallback(async () => {
    try {
      const promises = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        promises.push(
          adminAPI.dashboard.getDailySummary(dateStr)
            .then(dailySummary => ({
              date: date.toLocaleDateString('en-US', { weekday: 'short' }),
              sales: dailySummary.summary?.totalRevenue || 0,
              orders: dailySummary.summary?.totalOrders || 0
            }))
            .catch(() => ({
              date: date.toLocaleDateString('en-US', { weekday: 'short' }),
              sales: 0,
              orders: 0
            }))
        );
      }
      
      const results = await Promise.all(promises);
      setChartData(results);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setChartData([]);
    }
  }, []);

  // Debounce mechanism to prevent rapid successive calls
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAutoRefresh, setLastAutoRefresh] = useState(Date.now());
  const [lastRefreshDisplay, setLastRefreshDisplay] = useState('');
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [prefetchedRoutes, setPrefetchedRoutes] = useState(new Set());
  const REFRESH_DEBOUNCE_DELAY = 1000; // 1 second for faster refresh

  // Load dashboard data (Ultra-fast parallel loading)
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || !authChecked) return;
    
    // Check debounce to prevent rapid successive requests
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_DEBOUNCE_DELAY) {
      const remainingTime = Math.ceil((REFRESH_DEBOUNCE_DELAY - (now - lastRefreshTime)) / 1000);
      showNotification(`Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before refreshing again.`, 'warning');
      return;
    }
    
    setIsRefreshing(true);
    setLastRefreshTime(now);
    setLastAutoRefresh(now);
    setLastRefreshDisplay(new Date().toLocaleTimeString());
    
    setLoading(true);
    try {
      // Load ALL data in parallel for maximum speed
      await Promise.allSettled([
        loadStats(),
        loadRecentActivities(),
        loadChartData()
      ]);
    } catch (error) {
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, authChecked, loadStats, loadRecentActivities, loadChartData, lastRefreshTime]);

  // Load orders
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !authChecked) return;
    
    try {
      const response = await adminAPI.order.getOrders({ 
        limit: 100,
        status: filterStatus === 'all' ? '' : filterStatus 
      });
      
      const formattedOrders = response.orders?.map(order => ({
        id: order.geonetReference || order._id,
        customer: order.userId?.name || 'Unknown',
        product: `${order.network} ${order.capacity}GB`,
        amount: order.price || 0,
        status: order.status,
        date: new Date(order.createdAt),
        phoneNumber: order.phoneNumber,
        _id: order._id
      })) || [];
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showNotification('Failed to load orders', 'error');
    }
  }, [filterStatus, isAuthenticated, authChecked]);

  // Load users
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated || !authChecked) return;
    
    try {
      const response = await adminAPI.user.getUsers(1, 50, userSearchTerm);
      const formattedUsers = response.users?.map(user => ({
        id: user._id,
        name: user.name || 'Unknown',
        email: user.email || '',
        phone: user.phoneNumber || '',
        role: user.role || 'user',
        status: user.isDisabled ? 'inactive' : 'active',
        joinDate: user.createdAt,
        walletBalance: user.walletBalance || 0,
        isDisabled: user.isDisabled || false
      })) || [];
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      showNotification('Failed to load users', 'error');
    }
  }, [userSearchTerm, isAuthenticated, authChecked]);

  // Initialize dashboard
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load dashboard data when authenticated with auto-refresh
  useEffect(() => {
    if (isAuthenticated && authChecked) {
      loadDashboardData();
      
      // Auto-refresh dashboard data every 30 seconds
      const refreshInterval = setInterval(() => {
        loadDashboardData();
      }, 30000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, authChecked, loadDashboardData]);

  // Load orders when filterStatus changes or when orders tab is active with auto-refresh
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated && authChecked) {
      loadOrders();
      
      // Auto-refresh orders every 20 seconds when orders tab is active
      const ordersRefreshInterval = setInterval(() => {
        if (activeTab === 'orders') {
          loadOrders();
        }
      }, 20000);
      
      return () => clearInterval(ordersRefreshInterval);
    }
  }, [filterStatus, activeTab, loadOrders, isAuthenticated, authChecked]);

  // Load users when users tab is active with auto-refresh
  useEffect(() => {
    if (activeTab === 'users' && isAuthenticated && authChecked) {
      loadUsers();
      
      // Auto-refresh users every 25 seconds when users tab is active
      const usersRefreshInterval = setInterval(() => {
        if (activeTab === 'users') {
          loadUsers();
        }
      }, 25000);
      
      return () => clearInterval(usersRefreshInterval);
    }
  }, [activeTab, loadUsers, isAuthenticated, authChecked]);

  // Route prefetching for ultra-fast navigation
  const prefetchRoute = useCallback(async (route) => {
    if (prefetchedRoutes.has(route)) return;
    
    try {
      // Prefetch the route using Next.js router
      await router.prefetch(route);
      setPrefetchedRoutes(prev => new Set([...prev, route]));
      console.log(`Route prefetched: ${route}`);
    } catch (error) {
      console.warn(`Failed to prefetch route ${route}:`, error);
    }
  }, [router, prefetchedRoutes]);

  // Prefetch all admin routes on component mount
  useEffect(() => {
    if (isAuthenticated && authChecked) {
      const routesToPrefetch = [
        '/admin/control-center',
        '/admin/products',
        '/admin/bulk-messaging',
        '/admin/package-management',
        '/admin/analytics',
        '/admin/agents',
        '/admin/agent-stores',
        '/admin/transactions',
        '/admin/reports',
        '/admin/settings'
      ];
      
      // Prefetch routes with a small delay to avoid blocking initial load
      setTimeout(() => {
        routesToPrefetch.forEach(route => prefetchRoute(route));
      }, 1000);
    }
  }, [isAuthenticated, authChecked, prefetchRoute]);

  // Keyboard shortcuts for faster refresh
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl/Cmd + R for refresh dashboard
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        loadDashboardData();
      }
      // F5 for refresh dashboard
      if (event.key === 'F5') {
        event.preventDefault();
        loadDashboardData();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loadDashboardData]);

  // Listen for pull-to-refresh events
  useEffect(() => {
    const handleRefreshAdminDashboard = () => {
      try {
        loadDashboardData();
      } catch (error) {
        console.error('Error refreshing admin dashboard:', error);
      }
    };

    window.addEventListener('refreshAdminDashboard', handleRefreshAdminDashboard);
    return () => window.removeEventListener('refreshAdminDashboard', handleRefreshAdminDashboard);
  }, [loadDashboardData]);

  // Notification system
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    router.push('/SignIn');
  }, [router]);

  // Navigation items
  const sidebarItems = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Home, badge: null },
    { id: 'control-center', label: 'Control Center', icon: Zap, badge: null, highlight: true },
    { id: 'users', label: 'Users', icon: Users, badge: stats.activeUsers || null },
    { id: 'agents', label: 'Agents', icon: Briefcase, badge: null },
    { id: 'agent-stores', label: 'Agent Stores', icon: Store, badge: null },
    { id: 'orders', label: 'Orders', icon: Package, badge: stats.pendingOrders || null },
    { id: 'products', label: 'Products', icon: Package2, badge: null },
    { id: 'bulk-messaging', label: 'Bulk Messaging', icon: MessageSquare, badge: null },
    { id: 'package-management', label: 'Package Management', icon: Package2, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, badge: null },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ], [stats.activeUsers, stats.pendingOrders]);

  // Handle navigation for tabs that go to separate pages
  const handleTabClick = useCallback(async (tabId) => {
    const navigationTabs = {
      'control-center': '/admin/control-center',
      'products': '/admin/products',
      'bulk-messaging': '/admin/bulk-messaging',
      'package-management': '/admin/package-management',
      'analytics': '/admin/analytics',
      'agents': '/admin/agents',
      'agent-stores': '/admin/agent-stores',
      'transactions': '/admin/transactions',
      'reports': '/admin/reports',
      'settings': '/admin/settings'
    };

    if (navigationTabs[tabId]) {
      setNavigationLoading(true);
      try {
        // Prefetch the route if not already prefetched
        if (!prefetchedRoutes.has(navigationTabs[tabId])) {
          await prefetchRoute(navigationTabs[tabId]);
        }
        
        // Navigate with optimized transition
        await router.push(navigationTabs[tabId]);
      } catch (error) {
        console.error('Navigation error:', error);
        showNotification('Failed to navigate to page', 'error');
      } finally {
        setNavigationLoading(false);
      }
    } else {
      // Instant tab switching for dashboard tabs
      setActiveTab(tabId);
    }
  }, [router, prefetchedRoutes, prefetchRoute]);

  // Components
  const StatCard = ({ title, value, change, icon: Icon, color, loading = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && !loading && (
          <div className={`flex items-center text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
        {loading && (
          <div className="animate-spin">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {loading ? 'Loading...' : value}
      </p>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    const colors = {
      order: 'text-blue-600 bg-blue-100',
      user: 'text-green-600 bg-green-100',
      payment: 'text-yellow-600 bg-yellow-100',
      alert: 'text-red-600 bg-red-100'
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${colors[activity.type] || colors.order}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
        </div>
      </div>
    );
  };

  // Main render sections
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Premium Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-yellow-500 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black">
                  Welcome back, {userData?.name || 'Admin'}! 👋
                </h2>
                <p className="text-black/80 text-sm md:text-base">
                  Here's your platform overview for {mounted && currentDate ? currentDate.split(',')[0] : 'today'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4 text-black" />
                <span className="text-sm font-semibold text-black">All Systems Online</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <Activity className="w-4 h-4 text-black" />
                <span className="text-sm font-semibold text-black">{stats.totalUsers} Total Users</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-black" />
                <span className="text-sm font-semibold text-black">GHS {stats.totalRevenue.toLocaleString()} Revenue</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex md:flex-col items-center md:items-end space-x-3 md:space-x-0 md:space-y-2">
            <button
              onClick={() => handleTabClick('control-center')}
              className="px-4 py-2 bg-black text-[#FFCC08] rounded-xl hover:bg-gray-900 transition-all font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={navigationLoading}
            >
              {navigationLoading ? (
                <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
              ) : (
                <Shield className="w-4 h-4 inline mr-2" />
              )}
              Control Center
            </button>
            <button
              onClick={() => handleTabClick('reports')}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-black rounded-xl hover:bg-white/30 transition-all font-semibold text-sm"
              disabled={navigationLoading}
            >
              {navigationLoading ? (
                <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 inline mr-2" />
              )}
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={8.5}
          icon={Users}
          color="from-blue-500 to-blue-600"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={stats.growthRate}
          icon={Package}
          color="from-green-500 to-green-600"
          loading={loading}
        />
        <StatCard
          title="Revenue"
          value={`GHS ${stats.totalRevenue.toLocaleString()}`}
          change={15.3}
          icon={DollarSign}
          color="from-yellow-500 to-yellow-600"
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={-2.4}
          icon={Activity}
          color="from-purple-500 to-purple-600"
          loading={loading}
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders.toLocaleString()}
          change={12.5}
          icon={Package}
          color="from-indigo-500 to-indigo-600"
          loading={loading}
        />
        <StatCard
          title="Today's Revenue"
          value={`GHS ${stats.todayRevenue.toLocaleString()}`}
          change={8.2}
          icon={DollarSign}
          color="from-emerald-500 to-emerald-600"
          loading={loading}
        />
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Enhanced with Recharts */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <select className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-[#FFCC08]">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          
          {/* Professional Chart with Recharts */}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFCC08" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFCC08" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#FFCC08', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#FFCC08" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
              </div>
            )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activities
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-black mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200"
          >
            <UserCheck className="w-8 h-8 text-black mx-auto mb-2" />
            <span className="text-sm font-medium text-black">Add User</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200"
          >
            <Package className="w-8 h-8 text-black mx-auto mb-2" />
            <span className="text-sm font-medium text-black">New Order</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200"
          >
            <Package2 className="w-8 h-8 text-black mx-auto mb-2" />
            <span className="text-sm font-medium text-black">Add Product</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all"
          >
            <FileText className="w-8 h-8 text-black mx-auto mb-2" />
            <span className="text-sm font-medium text-black">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });

    // User action handlers
    const handleViewUser = async (userId) => {
      try {
        const userOrders = await adminAPI.user.getUserOrders(userId);
        console.log('User orders:', userOrders);
        showNotification('User details loaded', 'success');
      } catch (error) {
        console.error('Failed to load user details:', error);
        showNotification('Failed to load user details', 'error');
      }
    };

    const handleEditUser = (user) => {
      console.log('Edit user:', user);
      setShowAddModal(true);
    };

    const handleToggleUserStatus = async (user) => {
      if (!isAuthenticated || !authChecked) return;
      
      try {
        const reason = user.isDisabled ? '' : 'Administrative action';
        await adminAPI.user.toggleUserStatus(user.id, reason);
        showNotification(
          user.isDisabled ? 'User account enabled' : 'User account disabled',
          'success'
        );
        loadUsers();
      } catch (error) {
        console.error('Failed to toggle user status:', error);
        showNotification('Failed to update user status', 'error');
      }
    };

    const handleDeleteUser = async (user) => {
      if (!isAuthenticated || !authChecked) return;
      
      if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
        try {
          await adminAPI.user.deleteUser(user.id);
          showNotification('User deleted successfully', 'success');
          loadUsers();
        } catch (error) {
          console.error('Failed to delete user:', error);
          showNotification('Failed to delete user', 'error');
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users and their permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="Dealer">Dealer</option>
              <option value="reporter">Reporter</option>
            </select>
            <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Users Table - Responsive Design */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <EmptyUsers />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            user.role === 'seller' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            user.role === 'Dealer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                            }`} />
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => handleViewUser(user.id)}
                        className="flex flex-col items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">View</span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex flex-col items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors active:scale-95"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors active:scale-95 ${
                          user.isDisabled 
                            ? 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                        }`}
                        title={user.isDisabled ? 'Enable User' : 'Disable User'}
                      >
                        {user.isDisabled ? 
                          <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                          <UserX className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        }
                        <span className={`text-[10px] mt-1 ${
                          user.isDisabled 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {user.isDisabled ? 'Enable' : 'Disable'}
                        </span>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="flex flex-col items-center justify-center p-2 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors active:scale-95"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-[10px] text-red-600 dark:text-red-400 mt-1">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        user.role === 'seller' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        user.role === 'Dealer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                        }`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewUser(user.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {user.isDisabled ? 
                            <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                            <UserX className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          }
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing 1 to {Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-[#FFCC08] text-black rounded-lg">1</button>
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const filteredOrders = orders.filter(order => 
      filterStatus === 'all' || order.status === filterStatus
    );

    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    // Order action handlers
    const handleUpdateOrderStatus = async (order) => {
      const newStatus = prompt(
        `Update order status for ${order.id}\nCurrent status: ${order.status}\n\nEnter new status (pending, processing, completed, failed):`
      );
      
      if (newStatus && ['pending', 'processing', 'completed', 'failed'].includes(newStatus)) {
        try {
          await adminAPI.order.updateOrderStatus(order._id, newStatus);
          showNotification(`Order status updated to ${newStatus}`, 'success');
          loadOrders();
        } catch (error) {
          console.error('Failed to update order status:', error);
          showNotification('Failed to update order status', 'error');
        }
      }
    };

    const handleViewOrderDetails = (order) => {
      alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.customer}\nProduct: ${order.product}\nAmount: GHS ${order.amount}\nStatus: ${order.status}\nPhone: ${order.phoneNumber}\nDate: ${order.date.toLocaleString()}`);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all customer orders</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#FFCC08] text-black rounded-xl hover:bg-yellow-500 transition-colors font-medium">
            <Plus className="w-5 h-5" />
            <span>New Order</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {orders.filter(o => o.status === 'processing').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completedOrders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {orders.filter(o => o.status === 'cancelled').length}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 inline-flex">
          {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-[#FFCC08] text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List - Responsive Design */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <p className="font-semibold text-gray-900 dark:text-white">#{order.id}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || statusColors.pending}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Product:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{order.product}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                        <span className="font-semibold text-[#FFCC08]">GHS {order.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span className="text-gray-600 dark:text-gray-300">{order.phoneNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="text-gray-600 dark:text-gray-300">{order.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                      <button 
                        onClick={() => handleUpdateOrderStatus(order)}
                        className="flex-1 px-3 py-2 bg-[#FFCC08] text-black rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors active:scale-95"
                      >
                        Update Status
                      </button>
                      <button 
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                    {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{order.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{order.customer}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{order.product}</td>
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        GHS {order.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {order.date.toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleUpdateOrderStatus(order)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline"
                          >
                              Update
                          </button>
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm hover:underline"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))}
              </tbody>
            </table>
          </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Show skeleton on initial load
    if (loading && activeTab === 'overview') {
      return <SkeletonDashboard />;
    }
    
    if (loading && activeTab === 'orders') {
      return <SkeletonTable />;
    }
    
    if (loading && activeTab === 'users') {
      return <SkeletonTable />;
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'orders':
        return renderOrders();
      case 'control-center':
      case 'products':
      case 'bulk-messaging':
      case 'package-management':
      case 'analytics':
      case 'agents':
      case 'agent-stores':
      case 'transactions':
      case 'reports':
      case 'settings':
        // These tabs navigate to separate pages, so show loading while navigating
        return (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Navigating to {activeTab.replace('-', ' ')}...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ 
      WebkitOverflowScrolling: 'touch',
      touchAction: 'manipulation'
    }}>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Overlay with better touch handling */}
      {sidebarOpen && !isDesktop && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={(e) => {
            // Prevent scrolling when overlay is touched
            e.preventDefault();
          }}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${sidebarOpen || isDesktop ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">UnlimitedData GH</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabClick(item.id);
                  // Close sidebar on mobile after selection
                  if (!isDesktop) {
                    setSidebarOpen(false);
                  }
                }}
                onMouseEnter={() => {
                  // Prefetch route on hover for faster navigation
                  const navigationTabs = {
                    'control-center': '/admin/control-center',
                    'products': '/admin/products',
                    'bulk-messaging': '/admin/bulk-messaging',
                    'package-management': '/admin/package-management',
                    'analytics': '/admin/analytics',
                    'agents': '/admin/agents',
                    'agent-stores': '/admin/agent-stores',
                    'transactions': '/admin/transactions',
                    'reports': '/admin/reports',
                    'settings': '/admin/settings'
                  };
                  
                  if (navigationTabs[item.id] && !prefetchedRoutes.has(navigationTabs[item.id])) {
                    prefetchRoute(navigationTabs[item.id]);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all mb-2 ${
                  isActive
                    ? item.highlight 
                      ? 'bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black shadow-lg'
                      : 'bg-[#FFCC08] text-black'
                    : item.highlight
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 text-[#FFCC08] hover:from-yellow-100 hover:to-orange-100'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                        isActive ? 'bg-black text-[#FFCC08]' : 'bg-[#FFCC08] text-black'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {userData?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.role || 'admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex justify-center"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                onTouchStart={(e) => {
                  // Better touch handling for mobile
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150 active:scale-95 touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }} // Better touch target size
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh dashboard data"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {mounted ? currentDate : 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {mounted ? currentTime : '--:--'}
                  {isRefreshing && (
                    <span className="ml-2 text-green-500 text-xs">● Refreshing</span>
                  )}
                  {lastRefreshDisplay && !isRefreshing && (
                    <span className="ml-2 text-blue-500 text-xs">● Last: {lastRefreshDisplay}</span>
                  )}
                  {navigationLoading && (
                    <span className="ml-2 text-purple-500 text-xs">● Navigating...</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Debug Panel - Only show in development */}
        {DEBUG_MODE && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Debug Mode</span>
                <span className="text-yellow-700 dark:text-yellow-300">API: {API_BASE_URL}</span>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Token: {typeof window !== 'undefined' && localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}
                </span>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Server: {stats.systemHealth === 'error' ? '❌ Error' : '✅ Connected'}
                </span>
              </div>
              <button
                onClick={() => {
                  console.log('Current stats:', stats);
                  console.log('API Base URL:', API_BASE_URL);
                  console.log('Auth Token:', typeof window !== 'undefined' ? localStorage.getItem('authToken') : 'N/A (SSR)');
                }}
                className="text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
              >
                Log Debug Info
              </button>
            </div>
          </div>
        )}

        {/* Page Content with better mobile padding */}
        <div className="p-2 sm:p-4 md:p-6 pb-20">
          {/* Mobile Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && !isDesktop && (
            <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-xs">
              <p>Mobile View: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Loading...'}</p>
              <p>Sidebar: {sidebarOpen ? 'Open' : 'Closed'}</p>
              <p>Desktop: {isDesktop ? 'Yes' : 'No'}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-[#FFCC08] animate-spin" />
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;