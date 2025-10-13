#!/usr/bin/env node

/**
 * Authentication Monitoring System
 * Monitors JWT authentication logs, performance, and security metrics
 */

const fs = require('fs');
const path = require('path');

class AuthMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/auth-monitor.log');
    this.metricsFile = path.join(__dirname, '../logs/auth-metrics.json');
    this.alertsFile = path.join(__dirname, '../logs/auth-alerts.json');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Initialize metrics
    this.metrics = {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      tokenValidations: 0,
      tokenExpirations: 0,
      apiCalls: 0,
      unauthorizedAccess: 0,
      lastUpdated: new Date().toISOString()
    };
    
    // Load existing metrics
    this.loadMetrics();
  }
  
  // Log authentication events
  logAuthEvent(event, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      data,
      level: 'info'
    };
    
    // Write to log file
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    
    // Update metrics
    this.updateMetrics(event, data);
    
    // Check for alerts
    this.checkAlerts(event, data);
    
    console.log(`🔐 Auth Monitor: ${event} - ${JSON.stringify(data)}`);
  }
  
  // Update metrics based on events
  updateMetrics(event, data) {
    switch (event) {
      case 'login_attempt':
        this.metrics.totalLogins++;
        break;
      case 'login_success':
        this.metrics.successfulLogins++;
        break;
      case 'login_failure':
        this.metrics.failedLogins++;
        break;
      case 'token_validation':
        this.metrics.tokenValidations++;
        break;
      case 'token_expiration':
        this.metrics.tokenExpirations++;
        break;
      case 'api_call':
        this.metrics.apiCalls++;
        break;
      case 'unauthorized_access':
        this.metrics.unauthorizedAccess++;
        break;
    }
    
    this.metrics.lastUpdated = new Date().toISOString();
    this.saveMetrics();
  }
  
  // Check for security alerts
  checkAlerts(event, data) {
    const alerts = [];
    
    // Check for failed login attempts
    if (event === 'login_failure') {
      const recentFailures = this.getRecentFailures(data.email);
      if (recentFailures >= 5) {
        alerts.push({
          type: 'security',
          severity: 'high',
          message: `Multiple failed login attempts for ${data.email}`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Check for token validation failures
    if (event === 'token_validation_failure') {
      alerts.push({
        type: 'security',
        severity: 'medium',
        message: 'Token validation failure detected',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for unauthorized access
    if (event === 'unauthorized_access') {
      alerts.push({
        type: 'security',
        severity: 'high',
        message: 'Unauthorized access attempt detected',
        timestamp: new Date().toISOString()
      });
    }
    
    // Save alerts
    if (alerts.length > 0) {
      this.saveAlerts(alerts);
    }
  }
  
  // Get recent failed login attempts
  getRecentFailures(email) {
    try {
      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      const recentTime = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      
      let failures = 0;
      lines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          if (entry.event === 'login_failure' && 
              entry.data.email === email && 
              new Date(entry.timestamp) > recentTime) {
            failures++;
          }
        } catch (e) {
          // Ignore invalid JSON lines
        }
      });
      
      return failures;
    } catch (error) {
      return 0;
    }
  }
  
  // Save metrics to file
  saveMetrics() {
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }
  
  // Load metrics from file
  loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf8');
        this.metrics = { ...this.metrics, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }
  
  // Save alerts to file
  saveAlerts(alerts) {
    try {
      let existingAlerts = [];
      if (fs.existsSync(this.alertsFile)) {
        const data = fs.readFileSync(this.alertsFile, 'utf8');
        existingAlerts = JSON.parse(data);
      }
      
      existingAlerts.push(...alerts);
      
      // Keep only last 100 alerts
      if (existingAlerts.length > 100) {
        existingAlerts = existingAlerts.slice(-100);
      }
      
      fs.writeFileSync(this.alertsFile, JSON.stringify(existingAlerts, null, 2));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }
  
  // Get authentication statistics
  getStats() {
    const successRate = this.metrics.totalLogins > 0 
      ? (this.metrics.successfulLogins / this.metrics.totalLogins * 100).toFixed(2)
      : 0;
    
    return {
      ...this.metrics,
      successRate: `${successRate}%`,
      failureRate: `${(100 - successRate).toFixed(2)}%`
    };
  }
  
  // Get recent alerts
  getAlerts(limit = 10) {
    try {
      if (fs.existsSync(this.alertsFile)) {
        const data = fs.readFileSync(this.alertsFile, 'utf8');
        const alerts = JSON.parse(data);
        return alerts.slice(-limit);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
    return [];
  }
  
  // Clean old logs
  cleanOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      if (fs.existsSync(this.logFile)) {
        const logContent = fs.readFileSync(this.logFile, 'utf8');
        const lines = logContent.split('\n').filter(line => line.trim());
        
        const filteredLines = lines.filter(line => {
          try {
            const entry = JSON.parse(line);
            return new Date(entry.timestamp) > cutoffDate;
          } catch (e) {
            return true; // Keep invalid JSON lines
          }
        });
        
        fs.writeFileSync(this.logFile, filteredLines.join('\n') + '\n');
      }
    } catch (error) {
      console.error('Error cleaning logs:', error);
    }
  }
}

// Export singleton instance
module.exports = new AuthMonitor();
