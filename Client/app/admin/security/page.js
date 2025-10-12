'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import adminAPI from '../../../utils/adminApi';
import {
  Shield, AlertTriangle, CheckCircle, X, Eye, EyeOff, Lock, Key,
  ArrowLeft, RefreshCw, Download, Upload, Plus, Edit, Trash2, Save,
  Settings, Bell, Activity, Clock, Users, Database, Server, Globe,
  AlertCircle, Search, Filter, BarChart3, TrendingUp, TrendingDown,
  FileText, Mail, Phone, MapPin, Building, Hash, Star, Zap
} from 'lucide-react';

const SecurityCompliancePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Security data state
  const [securityData, setSecurityData] = useState({
    overview: {
      securityScore: 85,
      threatsBlocked: 1247,
      vulnerabilities: 3,
      complianceScore: 92,
      lastScan: new Date(),
      nextScan: new Date(Date.now() + 7 * 86400000)
    },
    threats: [],
    vulnerabilities: [],
    auditLogs: [],
    compliance: [],
    securitySettings: {
      twoFactorAuth: true,
      passwordPolicy: 'strong',
      sessionTimeout: 30,
      ipWhitelist: false,
      rateLimiting: true,
      encryption: true
    }
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('week');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    checkAuth();
    loadSecurityData();
  }, [currentPage, itemsPerPage]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
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

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Mock security data
      const mockData = {
        overview: {
          securityScore: 85,
          threatsBlocked: 1247,
          vulnerabilities: 3,
          complianceScore: 92,
          lastScan: new Date(),
          nextScan: new Date(Date.now() + 7 * 86400000)
        },
        threats: [
          {
            id: 1,
            type: 'malware',
            severity: 'high',
            source: '192.168.1.100',
            description: 'Suspicious file upload detected',
            timestamp: new Date(),
            status: 'blocked',
            action: 'quarantined'
          },
          {
            id: 2,
            type: 'brute_force',
            severity: 'medium',
            source: '203.45.67.89',
            description: 'Multiple failed login attempts',
            timestamp: new Date(Date.now() - 3600000),
            status: 'blocked',
            action: 'ip_blocked'
          },
          {
            id: 3,
            type: 'sql_injection',
            severity: 'critical',
            source: '45.67.89.123',
            description: 'SQL injection attempt detected',
            timestamp: new Date(Date.now() - 7200000),
            status: 'blocked',
            action: 'request_blocked'
          }
        ],
        vulnerabilities: [
          {
            id: 1,
            title: 'Outdated SSL Certificate',
            severity: 'medium',
            description: 'SSL certificate expires in 30 days',
            affected: 'All HTTPS endpoints',
            fix: 'Renew SSL certificate',
            status: 'open',
            discovered: new Date(Date.now() - 86400000)
          },
          {
            id: 2,
            title: 'Weak Password Policy',
            severity: 'low',
            description: 'Password policy allows weak passwords',
            affected: 'User accounts',
            fix: 'Enforce stronger password requirements',
            status: 'in_progress',
            discovered: new Date(Date.now() - 172800000)
          },
          {
            id: 3,
            title: 'Missing Security Headers',
            severity: 'medium',
            description: 'Some security headers are missing',
            affected: 'Web application',
            fix: 'Add security headers',
            status: 'open',
            discovered: new Date(Date.now() - 259200000)
          }
        ],
        auditLogs: [
          {
            id: 1,
            user: 'admin@example.com',
            action: 'login',
            resource: 'admin dashboard',
            ip: '192.168.1.50',
            timestamp: new Date(),
            status: 'success',
            details: 'Successful admin login'
          },
          {
            id: 2,
            user: 'user@example.com',
            action: 'password_change',
            resource: 'user account',
            ip: '203.45.67.89',
            timestamp: new Date(Date.now() - 1800000),
            status: 'success',
            details: 'Password changed successfully'
          },
          {
            id: 3,
            user: 'admin@example.com',
            action: 'user_delete',
            resource: 'user management',
            ip: '192.168.1.50',
            timestamp: new Date(Date.now() - 3600000),
            status: 'success',
            details: 'User account deleted'
          }
        ],
        compliance: [
          {
            id: 1,
            standard: 'GDPR',
            score: 95,
            status: 'compliant',
            lastAudit: new Date(Date.now() - 30 * 86400000),
            nextAudit: new Date(Date.now() + 335 * 86400000),
            requirements: 28,
            met: 27
          },
          {
            id: 2,
            standard: 'PCI DSS',
            score: 88,
            status: 'mostly_compliant',
            lastAudit: new Date(Date.now() - 60 * 86400000),
            nextAudit: new Date(Date.now() + 305 * 86400000),
            requirements: 12,
            met: 11
          },
          {
            id: 3,
            standard: 'ISO 27001',
            score: 92,
            status: 'compliant',
            lastAudit: new Date(Date.now() - 90 * 86400000),
            nextAudit: new Date(Date.now() + 275 * 86400000),
            requirements: 114,
            met: 105
          }
        ]
      };

      setSecurityData(mockData);
      
    } catch (error) {
      console.error('Error loading security data:', error);
      showNotification('Failed to load security data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runSecurityScan = async () => {
    try {
      setLoading(true);
      showNotification('Security scan initiated...', 'info');
      // In real implementation, this would trigger an actual security scan
      setTimeout(() => {
        showNotification('Security scan completed successfully');
        loadSecurityData();
      }, 3000);
    } catch (error) {
      console.error('Error running security scan:', error);
      showNotification('Failed to run security scan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateSecuritySettings = async (settings) => {
    try {
      setLoading(true);
      setSecurityData(prev => ({
        ...prev,
        securitySettings: { ...prev.securitySettings, ...settings }
      }));
      showNotification('Security settings updated successfully');
    } catch (error) {
      console.error('Error updating security settings:', error);
      showNotification('Failed to update security settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'mostly_compliant': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Security & Compliance
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Advanced security monitoring and compliance management
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={runSecurityScan}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Run Scan</span>
              </button>
              
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={loadSecurityData}
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
              { id: 'threats', name: 'Threats', icon: AlertTriangle },
              { id: 'vulnerabilities', name: 'Vulnerabilities', icon: AlertCircle },
              { id: 'compliance', name: 'Compliance', icon: CheckCircle },
              { id: 'audit', name: 'Audit Logs', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
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
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(securityData.overview.securityScore)}`}>
                      {securityData.overview.securityScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+5% from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Threats Blocked</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {securityData.overview.threatsBlocked.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">-12% from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vulnerabilities</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {securityData.overview.vulnerabilities}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">-2 from last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(securityData.overview.complianceScore)}`}>
                      {securityData.overview.complianceScore}%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+3% from last month</span>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Status */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Firewall Active</span>
                    </div>
                    <span className="text-sm text-green-600">Protected</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">SSL Encryption</span>
                    </div>
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Password Policy</span>
                    </div>
                    <span className="text-sm text-yellow-600">Needs Update</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Auth</span>
                    </div>
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Recent Threats */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Threats</h3>
                <div className="space-y-3">
                  {securityData.threats.slice(0, 5).map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {threat.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {threat.source} • {formatDate(threat.timestamp)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit Settings
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(securityData.securitySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <div className="flex items-center space-x-2">
                      {typeof value === 'boolean' ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search threats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Threats Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Security Threats ({securityData.threats.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
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
                    {securityData.threats.map((threat) => (
                      <tr key={threat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(threat.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {threat.type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                            {threat.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {threat.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {threat.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(threat.status)}`}>
                            {threat.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Shield className="w-4 h-4" />
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

        {/* Vulnerabilities Tab */}
        {activeTab === 'vulnerabilities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Vulnerabilities</h3>
              <button
                onClick={runSecurityScan}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Scan for Vulnerabilities</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityData.vulnerabilities.map((vulnerability) => (
                <div key={vulnerability.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vulnerability.title}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(vulnerability.severity)}`}>
                      {vulnerability.severity}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                      <p className="text-sm text-gray-900 dark:text-white">{vulnerability.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Affected:</span>
                      <p className="text-sm text-gray-900 dark:text-white">{vulnerability.affected}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fix:</span>
                      <p className="text-sm text-gray-900 dark:text-white">{vulnerability.fix}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Discovered:</span>
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(vulnerability.discovered)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vulnerability.status)}`}>
                      {vulnerability.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                        Fix
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compliance Standards</h3>
              <button
                onClick={() => setShowComplianceModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Standard</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityData.compliance.map((standard) => (
                <div key={standard.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {standard.standard}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(standard.status)}`}>
                      {standard.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                      <span className={`text-lg font-bold ${getScoreColor(standard.score)}`}>
                        {standard.score}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          standard.score >= 90 ? 'bg-green-500' :
                          standard.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${standard.score}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Requirements:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {standard.met}/{standard.requirements}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Audit:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(standard.lastAudit)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next Audit:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(standard.nextAudit)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                      View Report
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                      Schedule Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="password_change">Password Change</option>
                  <option value="user_delete">User Delete</option>
                </select>
                
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Audit Logs ({securityData.auditLogs.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {securityData.auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.action.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.resource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.ip}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default SecurityCompliancePage;
