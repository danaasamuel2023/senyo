'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI, { userAPI } from '../../../utils/adminApi';
import { getApiUrl } from '../../../utils/envConfig';
import apiClient from '../../../utils/apiClient.js';
import { getAuthToken, getCurrentUser, isAuthenticated as checkIsAuthenticated, logout, withAuth, useAuth } from '../../../utils/auth.js';
import { useBottomNav } from '../../providers/BottomNavProvider.jsx';
import { 
  User, Users, BarChart3, Package, Clock, CreditCard, FileText, Settings, UserCog, 
  Search, Calendar, DollarSign, TrendingUp, LogOut, Sun, Moon, Menu, X, 
  AlertCircle, CheckCircle, RefreshCw, Plus, Filter, Download, 
  Upload, Edit, Trash2, Eye, Database, Shield, Activity, PieChart, ArrowUp, 
  ArrowDown, Bell, HelpCircle, Save, XCircle, Home, ShoppingCart, Wallet,
  UserCheck, UserX, Package2, Truck, AlertTriangle, ChevronDown, MoreVertical,
  Copy, ExternalLink, Mail, Phone, MapPin, Building, Hash, Star, Zap, Briefcase, Store, MessageSquare,
  Monitor, TrendingDown, Headphones, Megaphone, FileImage, Warehouse, 
  Workflow, Target, Smartphone, Globe, Cpu, HardDrive,
  Lock, ShoppingBag, Sparkles, Layers, BarChart2
} from 'lucide-react';
import { SkeletonDashboard, SkeletonTable, SkeletonList } from '../../../component/SkeletonLoaders.jsx';
import { EmptyOrders, EmptyUsers, EmptyError } from '../../../component/EmptyStates.jsx';
import DailyUsageMonitor from '../../../component/DailyUsageMonitor.jsx';

const AdminDashboard = () => {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { hideBottomNav, showBottomNav } = useBottomNav();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userData, setUserData] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({});

  // Notification system with queue
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [mounted, setMounted] = useState(false);
  
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
  const API_BASE_URL = getApiUrl();
  const DEBUG_MODE = process.env.NODE_ENV === 'development';
  
  // Cache for performance
  const [dataCache, setDataCache] = useState({});
  const CACHE_DURATION = 5 * 60 * 1000;

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Initialize sidebar state based on screen size with better mobile detection
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const isMobile = width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isDesktopView = !isMobile;
        
        setIsDesktop(isDesktopView);
        if (isDesktopView) {
          setSidebarOpen(true);
        } else {
          setSidebarOpen(false);
        }
      }
    };
    
    handleResize();
    
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedResize);
      window.addEventListener('orientationchange', debouncedResize);
    }
    
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

    updateTime();
    const interval = setInterval(updateTime, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Hide/show bottom nav when admin sidebar opens/closes on mobile
  useEffect(() => {
    if (sidebarOpen && !isDesktop) {
      hideBottomNav('admin-sidebar');
    } else {
      showBottomNav('admin-sidebar');
    }
  }, [sidebarOpen, isDesktop, hideBottomNav, showBottomNav]);

  // Animated counter effect for stats
  useEffect(() => {
    const animateValue = (key, start, end, duration = 1000) => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        setAnimatedStats(prev => ({ ...prev, [key]: current }));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    };

    Object.keys(stats).forEach(key => {
      if (typeof stats[key] === 'number' && stats[key] > 0) {
        animateValue(key, 0, stats[key]);
      }
    });
  }, [stats]);

  // Check authentication using centralized auth hook
  const checkAuth = useCallback(() => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth check:', {
          isAuthenticated,
          hasUser: !!user,
          userRole: user?.role,
          authLoading
        });
      }
      
      if (authLoading) return false;
      
      if (!isAuthenticated || !user || !['admin', 'superadmin'].includes(user.role)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Authentication failed or user is not admin - redirecting to login');
        }
        logout('/SignIn');
        return false;
      }
      
      setUserData(user);
      return true;
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      logout('/SignIn');
    }
  }, [isAuthenticated, user, authLoading]);

  // Retry function with exponential backoff
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if ((error.message.includes('Too many requests') || 
             error.message.includes('Rate limit bypassed in development') ||
             (error.isRateLimited && error.error === 'Rate limit bypassed in development')) && 
            attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limited, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  // Load statistics with enhanced caching
  const loadStats = useCallback(async () => {
    try {
      const cacheKey = 'dashboard_stats';
      const now = Date.now();
      
      if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp < (CACHE_DURATION * 2))) {
        setStats(dataCache[cacheKey].data);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        console.warn('No authentication token found, redirecting to login');
        logout('/SignIn');
        return;
      }

      if (DEBUG_MODE) {
        console.log('Loading dashboard statistics...');
      }
      
      const dashboardStats = await retryWithBackoff(() => adminAPI.dashboard.getStatistics()).catch(err => {
        console.error('Dashboard stats API error:', err.message);
        if (err.message.includes('Authentication required') || err.message.includes('Failed to fetch')) {
          if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
            showNotification('Admin server not available. Using demo data.', 'warning');
          } else {
            showNotification('Please sign in again', 'error');
            router.push('/SignIn');
            return { success: false, data: null };
          }
        } else {
          showNotification(`Failed to load dashboard statistics: ${err.message}`, 'error');
        }
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
      });
      
      if (dashboardStats.data === null) {
        console.warn('Authentication failed, redirecting to login');
        return;
      }

      const statsData = {
        totalUsers: dashboardStats.success ? (dashboardStats.data?.totalUsers || 0) : 0,
        activeUsers: dashboardStats.success ? Math.floor((dashboardStats.data?.totalUsers || 0) * 0.6) : 0,
        totalOrders: dashboardStats.success ? (dashboardStats.data?.totalOrders || 0) : 0,
        totalRevenue: dashboardStats.success ? (dashboardStats.data?.todayRevenue || 0) : 0,
        growthRate: 12.5,
        pendingOrders: Math.floor(Math.random() * 20) + 5,
        completedOrders: Math.floor(Math.random() * 100) + 50,
        totalProducts: 4,
        totalAgents: Math.floor(Math.random() * 50) + 10,
        activeAgents: Math.floor(Math.random() * 30) + 5,
        totalCommissions: Math.floor(Math.random() * 5000) + 1000,
        todayOrders: dashboardStats.success ? (dashboardStats.data?.todayOrders || 0) : 0,
        todayRevenue: dashboardStats.success ? (dashboardStats.data?.todayRevenue || 0) : 0,
        systemHealth: dashboardStats.success ? 'excellent' : 'error'
      };
      
      setStats(statsData);
      
      setDataCache(prev => ({
        ...prev,
        [cacheKey]: { data: statsData, timestamp: now }
      }));
      
      if (dashboardStats.success) {
        showNotification('Dashboard data refreshed successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      
      if (error.message.includes('Rate limit bypassed in development') || 
          (error.isRateLimited && error.error === 'Rate limit bypassed in development')) {
        showNotification('Using demo data (rate limit bypassed in development)', 'warning');
        
        setStats({
          totalUsers: 150,
          activeUsers: 89,
          totalOrders: 234,
          totalRevenue: 12500,
          growthRate: 12.5,
          pendingOrders: 12,
          completedOrders: 222,
          totalProducts: 45,
          totalAgents: 8,
          activeAgents: 6,
          totalCommissions: 890,
          todayRevenue: 450,
          todayOrders: 18,
          systemHealth: 'excellent'
        });
        return;
      }
      
      showNotification('Failed to load dashboard statistics', 'error');
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
  }, [dataCache, router, showNotification]);

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

  // Load recent activities with throttling
  const loadRecentActivities = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Add small delay between API calls to prevent rate limiting
      const [ordersData, transactionsData] = await Promise.allSettled([
        adminAPI.order.getOrders({ limit: 5 }).catch(error => {
          console.error('Orders API error:', error);
          return { orders: [] };
        }),
        new Promise(resolve => setTimeout(() => 
          adminAPI.transaction.getTransactions({ limit: 5 }).catch(error => {
            console.error('Transactions API error:', error);
            return { transactions: [] };
          }).then(resolve), 200 // 200ms delay
        ))
      ]);

      const ordersResult = ordersData.status === 'fulfilled' ? ordersData.value : { orders: [] };
      const transactionsResult = transactionsData.status === 'fulfilled' ? transactionsData.value : { transactions: [] };

      const activities = [];
      
      if (ordersResult.orders) {
        ordersResult.orders.forEach(order => {
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

      if (transactionsResult.transactions) {
        transactionsResult.transactions.forEach(transaction => {
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
  }, [getTimeAgo, isAuthenticated, user]);

  // Load chart data
  const loadChartData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const cacheKey = 'chart_data_7days';
      const cached = dataCache[cacheKey];
      
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        setChartData(cached.data);
        return;
      }
      
      const batchData = await apiClient.getAdminBatchDailySummary(7);
      
      if (batchData.success && batchData.data) {
        const dataArray = Array.isArray(batchData.data) ? batchData.data : batchData.data.summaries || [];
        const chartData = dataArray.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          sales: item.revenue || item.summary?.totalRevenue || 0,
          orders: item.orders || item.summary?.totalOrders || 0
        }));
        
        setChartData(chartData);
        
        setDataCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: chartData,
            timestamp: Date.now()
          }
        }));
      } else {
        const mockData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sales: Math.floor(Math.random() * 1000) + 500,
            orders: Math.floor(Math.random() * 50) + 20
          });
        }
        setChartData(mockData);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
      
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: Math.floor(Math.random() * 1000) + 500,
          orders: Math.floor(Math.random() * 50) + 20
        });
      }
      setChartData(mockData);
    }
  }, [dataCache, isAuthenticated, user]);

  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAutoRefresh, setLastAutoRefresh] = useState(Date.now());
  const [lastRefreshDisplay, setLastRefreshDisplay] = useState('');
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [prefetchedRoutes, setPrefetchedRoutes] = useState(new Set());
  const REFRESH_DEBOUNCE_DELAY = 1000;
  
  const navScrollRef = useRef(null);

  // Prefetch route for better navigation performance
  const prefetchRoute = useCallback(async (route) => {
    if (prefetchedRoutes.has(route)) return;
    
    try {
      // Prefetch the route
      await router.prefetch(route);
      setPrefetchedRoutes(prev => new Set([...prev, route]));
    } catch (error) {
      console.error('Failed to prefetch route:', error);
    }
  }, [router, prefetchedRoutes]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    const now = Date.now();
    if (now - lastRefreshTime < REFRESH_DEBOUNCE_DELAY) {
      const remainingTime = Math.ceil((REFRESH_DEBOUNCE_DELAY - (now - lastRefreshTime)) / 1000);
      showNotification(`Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before refreshing again.`, 'warning');
      return;
    }
    
    setIsRefreshing(true);
    setPulseAnimation(true);
    setLastRefreshTime(now);
    setLastAutoRefresh(now);
    setLastRefreshDisplay(new Date().toLocaleTimeString());
    
    setLoading(true);
    try {
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
      setTimeout(() => setPulseAnimation(false), 1000);
    }
  }, [isAuthenticated, user, loadStats, loadRecentActivities, loadChartData, lastRefreshTime, showNotification]);

  // Load orders
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
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
  }, [filterStatus, isAuthenticated, user, showNotification]);

  // Load users
  const loadUsers = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const token = getAuthToken();
      const userData = getCurrentUser();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Admin Dashboard - Loading users with auth:', {
          hasToken: !!token,
          hasUserData: !!userData,
          isAuthenticated
        });
      }
      
      const response = await userAPI.getUsers(1, 50, userSearchTerm);
      
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
  }, [userSearchTerm, isAuthenticated, user, showNotification]);

  // Initialize dashboard
  useEffect(() => {
    checkAuth();
  }, [isAuthenticated, user, authLoading]);

  // Load dashboard data when authenticated with auto-refresh
  useEffect(() => {
    if (isAuthenticated && user) {
      const timer = setTimeout(() => {
        loadDashboardData();
        
        const refreshInterval = setInterval(() => {
          loadDashboardData();
        }, 60000); // Increased from 30s to 60s to reduce API calls
        
        window.dashboardRefreshInterval = refreshInterval;
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (window.dashboardRefreshInterval) {
          clearInterval(window.dashboardRefreshInterval);
        }
      };
    }
  }, [isAuthenticated, user, loadDashboardData]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated && user) {
      loadOrders();
      
      const ordersRefreshInterval = setInterval(() => {
        if (activeTab === 'orders') {
          loadOrders();
        }
      }, 20000);
      
      return () => clearInterval(ordersRefreshInterval);
    }
  }, [filterStatus, activeTab, loadOrders, isAuthenticated, user]);

  // Load users
  useEffect(() => {
    if (activeTab === 'users' && isAuthenticated && user) {
      loadUsers();
      
      const usersRefreshInterval = setInterval(() => {
        if (activeTab === 'users') {
          loadUsers();
        }
      }, 25000);
      
      return () => clearInterval(usersRefreshInterval);
    }
  }, [activeTab, loadUsers, isAuthenticated, user]);


  // Prefetch routes
  useEffect(() => {
    if (isAuthenticated && user) {
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
      
      setTimeout(() => {
        routesToPrefetch.forEach(route => prefetchRoute(route));
      }, 1000);
    }
  }, [isAuthenticated, user, prefetchRoute]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        loadDashboardData();
      }
      if (event.key === 'F5') {
        event.preventDefault();
        loadDashboardData();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loadDashboardData]);

  // Pull-to-refresh
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
    { id: 'user-management', label: 'Advanced Users', icon: UserCog, badge: null },
    { id: 'agents', label: 'Agents', icon: Briefcase, badge: null },
    { id: 'agent-stores', label: 'Agent Stores', icon: Store, badge: null },
    { id: 'orders', label: 'Orders', icon: Package, badge: stats.pendingOrders || null },
    { id: 'products', label: 'Products', icon: Package2, badge: null },
    { id: 'performance', label: 'Performance', icon: Monitor, badge: null },
    { id: 'financial', label: 'Financial', icon: DollarSign, badge: null },
    { id: 'security', label: 'Security', icon: Lock, badge: null },
    { id: 'support', label: 'Support', icon: Headphones, badge: null },
    { id: 'content', label: 'Content', icon: FileImage, badge: null },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, badge: null },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, badge: null },
    { id: 'automation', label: 'Automation', icon: Workflow, badge: null },
    { id: 'integrations', label: 'Integrations', icon: Globe, badge: null },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone, badge: null },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: null },
    { id: 'bulk-messaging', label: 'Bulk Messaging', icon: MessageSquare, badge: null },
    { id: 'package-management', label: 'Package Management', icon: Package2, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, badge: null },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ], [stats.activeUsers, stats.pendingOrders]);

  // Handle navigation
  const handleTabClick = useCallback(async (tabId) => {
    const navigationTabs = {
      'control-center': '/admin/control-center',
      'users': '/admin/users',
      'user-management': '/admin/user-management',
      'agents': '/admin/agents',
      'agent-stores': '/admin/agent-stores',
      'orders': '/admin/orders',
      'products': '/admin/products',
      'performance': '/admin/performance',
      'financial': '/admin/financial',
      'security': '/admin/security',
      'support': '/admin/support',
      'content': '/admin/content',
      'marketing': '/admin/marketing',
      'inventory': '/admin/inventory',
      'automation': '/admin/automation',
      'integrations': '/admin/integrations',
      'mobile': '/admin/mobile',
      'notifications': '/admin/notifications',
      'bulk-messaging': '/admin/bulk-messaging',
      'package-management': '/admin/package-management',
      'analytics': '/admin/analytics',
      'transactions': '/admin/transactions',
      'reports': '/admin/reports',
      'settings': '/admin/settings'
    };

    if (navigationTabs[tabId]) {
      setNavigationLoading(true);
      setIsAnimating(true);
      try {
        if (!prefetchedRoutes.has(navigationTabs[tabId])) {
          await prefetchRoute(navigationTabs[tabId]);
        }
        await router.push(navigationTabs[tabId]);
      } catch (error) {
        console.error('Navigation error:', error);
        showNotification('Failed to navigate to page', 'error');
      } finally {
        setNavigationLoading(false);
        setIsAnimating(false);
      }
    } else {
      setActiveTab(tabId);
    }
  }, [router, prefetchedRoutes, prefetchRoute]);

  // Enhanced StatCard with animations
  const StatCard = ({ title, value, change, icon: Icon, color, loading = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const displayValue = animatedStats[title.toLowerCase().replace(/[^a-z]/g, '')] || value;

    return (
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden group ${
          isHovered ? 'scale-105' : ''
        }`}
        onMouseEnter={() => {
          setIsHovered(true);
          setHoveredCard(title);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredCard(null);
        }}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Sparkle effect on hover */}
        {isHovered && (
          <div className="absolute top-2 right-2 animate-ping">
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${color} transform transition-transform duration-300 ${
              isHovered ? 'scale-110 rotate-6' : ''
            }`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {change !== undefined && !loading && (
              <div className={`flex items-center text-sm font-medium px-2.5 py-1 rounded-full ${
                change >= 0 
                  ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                  : 'text-red-600 bg-red-100 dark:bg-red-900/20'
              } transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
                {change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
            {loading && (
              <div className="animate-spin">
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
            {title}
          </h3>
          <p className={`text-2xl font-bold text-gray-900 dark:text-white mt-1 transition-all duration-300 ${
            isHovered ? 'text-3xl' : ''
          }`}>
            {loading ? (
              <span className="inline-block animate-pulse">Loading...</span>
            ) : (
              <span className="inline-block">{displayValue}</span>
            )}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${color} transition-all duration-500 ${
          isHovered ? 'w-full' : 'w-0'
        }`} />
      </div>
    );
  };

  // Enhanced ActivityItem
  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    const [isHovered, setIsHovered] = useState(false);
    const colors = {
      order: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      user: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      payment: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      alert: 'text-red-600 bg-red-100 dark:bg-red-900/20'
    };

    return (
      <div 
        className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 transform ${
          isHovered 
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 scale-105 shadow-md' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`p-2 rounded-lg ${colors[activity.type] || colors.order} transition-transform duration-300 ${
          isHovered ? 'scale-110 rotate-6' : ''
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
        </div>
        {isHovered && (
          <ChevronRight className="w-4 h-4 text-gray-400 animate-pulse" />
        )}
      </div>
    );
  };

  // Main render sections
  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Premium Welcome Banner with enhanced animations */}
      <div className="relative bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-yellow-500 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden group">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-transform group-hover:rotate-12 group-hover:scale-110">
                <Zap className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-2">
                  Welcome back, {userData?.name || 'Admin'}! 
                  <span className="inline-block animate-wave">👋</span>
                </h2>
                <p className="text-black/80 text-sm md:text-base">
                  Here's your platform overview for {mounted && currentDate ? currentDate.split(',')[0] : 'today'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl transform transition-all hover:scale-105 hover:bg-black/30">
                <CheckCircle className="w-4 h-4 text-black animate-pulse" />
                <span className="text-sm font-semibold text-black">All Systems Online</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl transform transition-all hover:scale-105 hover:bg-black/30">
                <Activity className="w-4 h-4 text-black" />
                <span className="text-sm font-semibold text-black">{stats.totalUsers} Total Users</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl transform transition-all hover:scale-105 hover:bg-black/30">
                <TrendingUp className="w-4 h-4 text-black" />
                <span className="text-sm font-semibold text-black">GHS {stats.totalRevenue.toLocaleString()} Revenue</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex md:flex-col items-center md:items-end space-x-3 md:space-x-0 md:space-y-2">
            <button
              onClick={() => handleTabClick('control-center')}
              className="px-4 py-2 bg-black text-[#FFCC08] rounded-xl hover:bg-gray-900 transition-all font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 active:scale-95"
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
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-black rounded-xl hover:bg-white/30 transition-all font-semibold text-sm transform hover:scale-105 active:scale-95"
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

      {/* Stats Grid with stagger animation */}
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

      {/* Daily Usage Monitor */}
      <DailyUsageMonitor />

      {/* Charts and Activities with enhanced design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
              </div>
              <select className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-[#FFCC08] transition-all hover:bg-gray-200 dark:hover:bg-gray-600">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-center relative z-10">
                <div className="relative inline-block">
                  <BarChart3 className="w-16 h-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-3 animate-bounce" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-yellow-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Revenue Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-2">Chart visualization coming soon</p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">{stats.totalUsers} Users</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                    <Package className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{stats.totalOrders} Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="relative bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-xl overflow-hidden group">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-black/20 rounded-lg">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold text-black">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              <UserCheck className="w-8 h-8 text-black mx-auto mb-2" />
              <span className="text-sm font-medium text-black">Add User</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              <Package className="w-8 h-8 text-black mx-auto mb-2" />
              <span className="text-sm font-medium text-black">New Order</span>
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              <Package2 className="w-8 h-8 text-black mx-auto mb-2" />
              <span className="text-sm font-medium text-black">Add Product</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="bg-black/10 hover:bg-black/20 backdrop-blur rounded-xl p-4 text-center transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              <FileText className="w-8 h-8 text-black mx-auto mb-2" />
              <span className="text-sm font-medium text-black">Generate Report</span>
            </button>
          </div>
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

    const handleViewUser = async (userId) => {
      try {
        const userOrders = await adminAPI.user.getUserOrders(userId);
        showNotification('User details loaded', 'success');
      } catch (error) {
        console.error('Failed to load user details:', error);
        showNotification('Failed to load user details', 'error');
      }
    };

    const handleEditUser = (user) => {
      setShowAddModal(true);
    };

    const handleToggleUserStatus = async (user) => {
      if (!isAuthenticated || !user) return;
      
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
      if (!isAuthenticated || !user) return;
      
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
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-[#FFCC08]" />
              User Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users and their permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl hover:shadow-lg transition-all font-medium transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-[#FFCC08]" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08] transition-all hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="Dealer">Dealer</option>
              <option value="reporter">Reporter</option>
            </select>
            <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
          {filteredUsers.length === 0 ? (
            <EmptyUsers />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {filteredUsers.map((user, index) => (
                  <div 
                    key={user.id} 
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all transform hover:scale-102 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold text-lg flex-shrink-0 shadow-md">
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
                              user.status === 'active' ? 'bg-green-600 animate-pulse' : 'bg-red-600'
                            }`} />
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
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
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => handleViewUser(user.id)}
                        className="flex flex-col items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 transform hover:scale-105"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">View</span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex flex-col items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all active:scale-95 transform hover:scale-105"
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all active:scale-95 transform hover:scale-105 ${
                          user.isDisabled 
                            ? 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30'
                            : 'bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                        }`}
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
                        className="flex flex-col items-center justify-center p-2 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-all active:scale-95 transform hover:scale-105"
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
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/10 dark:hover:to-orange-900/10 transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 flex items-center justify-center text-black font-bold shadow-md">
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
                              user.status === 'active' ? 'bg-green-600 animate-pulse' : 'bg-red-600'
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
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                            >
                              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                            >
                              {user.isDisabled ? 
                                <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                                <UserX className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              }
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all transform hover:scale-110 active:scale-95"
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

          {/* Enhanced Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing 1 to {Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-lg shadow-md">1</button>
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95">
                2
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95">
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
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-7 h-7 text-[#FFCC08]" />
              Orders Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all customer orders</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl hover:shadow-lg transition-all font-medium transform hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" />
            <span>New Order</span>
          </button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-yellow-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-blue-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {orders.filter(o => o.status === 'processing').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-green-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completedOrders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-l-4 border-red-500 hover:shadow-lg transition-all transform hover:-translate-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {orders.filter(o => o.status === 'cancelled').length}
            </p>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 inline-flex shadow-md">
          {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black shadow-lg scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Enhanced Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
          {filteredOrders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 p-4">
                {filteredOrders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all transform hover:scale-102 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
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
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                      <button 
                        onClick={() => handleUpdateOrderStatus(order)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-lg text-sm font-medium hover:shadow-lg transition-all active:scale-95 transform hover:scale-105"
                      >
                        Update Status
                      </button>
                      <button 
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 transform hover:scale-105"
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
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
                    {filteredOrders.map((order, index) => (
                      <tr 
                        key={order.id} 
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/10 dark:hover:to-orange-900/10 transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
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
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline transition-all transform hover:scale-110"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleViewOrderDetails(order)}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm hover:underline transition-all transform hover:scale-110"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" style={{ 
      WebkitOverflowScrolling: 'touch',
      touchAction: 'manipulation'
    }}>
      {/* Enhanced Notification Toast with animation */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-slide-down ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : notification.type === 'warning'
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 animate-bounce" />
          ) : notification.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          ) : (
            <XCircle className="w-5 h-5 animate-pulse" />
          )}
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            className="ml-4 hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Enhanced Mobile Overlay */}
      {sidebarOpen && !isDesktop && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={(e) => {
            e.preventDefault();
          }}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${sidebarOpen || isDesktop ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
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
        
        {/* Scrollable Navigation */}
        <div className="relative">

          <nav 
            ref={navScrollRef}
            className="flex flex-col space-y-1 p-3 overflow-y-auto overflow-x-hidden"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabClick(item.id);
                    if (!isDesktop) {
                      setSidebarOpen(false);
                    }
                  }}
                  onMouseEnter={() => {
                    const navigationTabs = {
                      'control-center': '/admin/control-center',
                      'users': '/admin/users',
                      'user-management': '/admin/user-management',
                      'agents': '/admin/agents',
                      'agent-stores': '/admin/agent-stores',
                      'orders': '/admin/orders',
                      'products': '/admin/products',
                      'performance': '/admin/performance',
                      'financial': '/admin/financial',
                      'security': '/admin/security',
                      'support': '/admin/support',
                      'content': '/admin/content',
                      'marketing': '/admin/marketing',
                      'inventory': '/admin/inventory',
                      'automation': '/admin/automation',
                      'integrations': '/admin/integrations',
                      'mobile': '/admin/mobile',
                      'notifications': '/admin/notifications',
                      'bulk-messaging': '/admin/bulk-messaging',
                      'package-management': '/admin/package-management',
                      'analytics': '/admin/analytics',
                      'transactions': '/admin/transactions',
                      'reports': '/admin/reports',
                      'settings': '/admin/settings'
                    };
                    
                    if (navigationTabs[item.id] && !prefetchedRoutes.has(navigationTabs[item.id])) {
                      prefetchRoute(navigationTabs[item.id]);
                    }
                  }}
                  className={`group relative flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isActive
                      ? item.highlight 
                        ? 'bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-[#FFCC08] text-black shadow-lg shadow-yellow-500/25 border border-yellow-300'
                        : 'bg-gradient-to-r from-[#FFCC08] to-yellow-400 text-black shadow-md border border-yellow-200'
                      : item.highlight
                        ? 'text-[#FFCC08] hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:text-yellow-600 dark:hover:text-yellow-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-full shadow-sm" />
                  )}
                  
                  {/* Icon with enhanced styling */}
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-black/10 shadow-sm' 
                      : 'bg-transparent group-hover:bg-white/10 dark:group-hover:bg-gray-600/20'
                  }`}>
                    <Icon className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                    
                    {/* Notification dot for highlight items */}
                    {item.highlight && !isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Label and badge */}
                  {sidebarOpen && (
                    <div className="flex items-center justify-between flex-1 ml-3 min-w-0">
                      <span className={`font-medium text-sm truncate transition-all duration-200 ${
                        isActive ? 'font-semibold' : 'group-hover:font-medium'
                      }`}>
                        {item.label}
                      </span>
                      
                      {/* Badge with modern styling */}
                      {item.badge && item.badge > 0 && (
                        <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                          isActive 
                            ? 'bg-black text-[#FFCC08] shadow-sm' 
                            : 'bg-gradient-to-r from-[#FFCC08] to-yellow-400 text-black shadow-sm group-hover:shadow-md'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-white/20 to-transparent' 
                      : 'bg-gradient-to-r from-transparent to-transparent group-hover:from-white/5 group-hover:to-transparent'
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Enhanced User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
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
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all transform hover:scale-110 active:scale-95"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-all flex justify-center transform hover:scale-110 active:scale-95"
            >
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        {/* Enhanced Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                className="p-2 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 rounded-lg transition-all duration-150 active:scale-95 touch-manipulation transform hover:scale-110"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
                </h1>
                {pulseAnimation && (
                  <p className="text-xs text-green-500 dark:text-green-400 animate-pulse">● Live updating...</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all transform hover:scale-110 active:scale-95">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 rounded-lg transition-all transform hover:scale-110 active:scale-95"
                title="Refresh dashboard data (Ctrl+R or F5)"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {mounted ? currentDate : 'Loading...'}
                </p>
                <div className="flex items-center justify-end space-x-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {mounted ? currentTime : '--:--'}
                  </span>
                  {isRefreshing && (
                    <span className="flex items-center text-green-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                      Refreshing
                    </span>
                  )}
                  {lastRefreshDisplay && !isRefreshing && (
                    <span className="text-blue-500">
                      ● Last: {lastRefreshDisplay}
                    </span>
                  )}
                  {navigationLoading && (
                    <span className="flex items-center text-purple-500">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-1" />
                      Navigating
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Debug Panel - Only show in development */}
        {DEBUG_MODE && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Debug Mode</span>
                <span className="text-yellow-700 dark:text-yellow-300">API: {API_BASE_URL}</span>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Token: {isAuthenticated && user ? '✅ Present' : '❌ Missing'}
                </span>
                <span className="text-yellow-700 dark:text-yellow-300">
                  Server: {stats.systemHealth === 'error' ? '❌ Error' : '✅ Connected'}
                </span>
              </div>
              <button
                onClick={() => {
                  console.log('Current stats:', stats);
                  console.log('API Base URL:', API_BASE_URL);
                  console.log('Auth Token:', isAuthenticated && user ? 'Present' : 'Missing');
                  console.log('Auth State:', { isAuthenticated, user, userData });
                  console.log('Auth Utilities Debug:');
                  console.log('- getAuthToken():', getAuthToken() ? 'Present' : 'Missing');
                  console.log('- getCurrentUser():', getCurrentUser());
                  console.log('- checkIsAuthenticated():', checkIsAuthenticated());
                }}
                className="text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors"
              >
                Log Debug Info
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-2 sm:p-4 md:p-6 pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-[#FFCC08] animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading amazing content...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-wave {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFCC08;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f0b700;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;