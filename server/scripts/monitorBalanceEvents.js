#!/usr/bin/env node

/**
 * Balance Update Events Monitor
 * Monitors memory usage and performance of global.balanceUpdateEvents
 */

const fs = require('fs');
const path = require('path');

class BalanceEventMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/balance-events.log');
    this.stats = {
      totalEvents: 0,
      activeEvents: 0,
      memoryPeak: 0,
      lastCleanup: new Date(),
      errors: 0
    };
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      ...data,
      stats: { ...this.stats }
    };
    
    console.log(`[${timestamp}] ${message}`, data);
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  monitorMemoryUsage() {
    const memUsage = process.memoryUsage();
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    
    if (rssMB > this.stats.memoryPeak) {
      this.stats.memoryPeak = rssMB;
    }
    
    return {
      rss: rssMB,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
  }

  checkBalanceEvents() {
    if (!global.balanceUpdateEvents) {
      return {
        exists: false,
        size: 0,
        events: []
      };
    }

    const events = Array.from(global.balanceUpdateEvents.entries()).map(([userId, event]) => ({
      userId,
      ...event,
      age: Date.now() - new Date(event.timestamp).getTime()
    }));

    this.stats.activeEvents = events.length;
    
    return {
      exists: true,
      size: global.balanceUpdateEvents.size,
      events,
      oldestEvent: events.length > 0 ? Math.max(...events.map(e => e.age)) : 0
    };
  }

  cleanupOldEvents(maxAgeMs = 300000) { // 5 minutes default
    if (!global.balanceUpdateEvents) return 0;
    
    let cleaned = 0;
    const now = Date.now();
    
    for (const [userId, event] of global.balanceUpdateEvents.entries()) {
      const age = now - new Date(event.timestamp).getTime();
      if (age > maxAgeMs) {
        global.balanceUpdateEvents.delete(userId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.stats.lastCleanup = new Date();
      this.log(`Cleaned up ${cleaned} old balance events`, { cleaned, maxAgeMs });
    }
    
    return cleaned;
  }

  generateReport() {
    const memory = this.monitorMemoryUsage();
    const events = this.checkBalanceEvents();
    
    const report = {
      timestamp: new Date().toISOString(),
      memory,
      events,
      stats: this.stats,
      recommendations: []
    };

    // Generate recommendations
    if (events.size > 100) {
      report.recommendations.push('High number of pending events - consider cleanup');
    }
    
    if (memory.rss > 100) {
      report.recommendations.push('High memory usage - monitor for leaks');
    }
    
    if (events.oldestEvent > 600000) { // 10 minutes
      report.recommendations.push('Old events detected - cleanup recommended');
    }

    this.log('Balance events report generated', report);
    return report;
  }

  startMonitoring(intervalMs = 30000) { // 30 seconds default
    this.log('Starting balance events monitoring', { intervalMs });
    
    const monitor = () => {
      try {
        this.generateReport();
        this.cleanupOldEvents();
      } catch (error) {
        this.stats.errors++;
        this.log('Monitoring error', { error: error.message });
      }
    };

    // Initial report
    monitor();
    
    // Set up interval
    setInterval(monitor, intervalMs);
    
    // Cleanup on exit
    process.on('SIGINT', () => {
      this.log('Monitoring stopped');
      process.exit(0);
    });
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new BalanceEventMonitor();
  monitor.startMonitoring();
}

module.exports = BalanceEventMonitor;
