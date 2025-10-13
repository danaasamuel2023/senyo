const express = require('express');
const authMonitor = require('../monitoring/auth-monitor');
const router = express.Router();

// Monitoring dashboard endpoint (admin only)
router.get('/dashboard', (req, res) => {
  try {
    const stats = authMonitor.getStats();
    const alerts = authMonitor.getAlerts(20);
    
    res.json({
      success: true,
      data: {
        stats,
        alerts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monitoring data'
    });
  }
});

// Authentication statistics endpoint
router.get('/auth-stats', (req, res) => {
  try {
    const stats = authMonitor.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Auth stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching auth statistics'
    });
  }
});

// Security alerts endpoint
router.get('/alerts', (req, res) => {
  try {
    const alerts = authMonitor.getAlerts(50);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  try {
    const stats = authMonitor.getStats();
    const alerts = authMonitor.getAlerts(5);
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalLogins: stats.totalLogins,
        successRate: stats.successRate,
        recentAlerts: alerts.length
      }
    };
    
    // Check for critical alerts
    const criticalAlerts = alerts.filter(alert => alert.severity === 'high');
    if (criticalAlerts.length > 0) {
      healthStatus.status = 'warning';
      healthStatus.criticalAlerts = criticalAlerts.length;
    }
    
    res.json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
