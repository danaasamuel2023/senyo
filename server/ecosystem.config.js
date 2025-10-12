module.exports = {
  apps: [{
    name: 'senyo-server',
    script: 'index.js',
    instances: 'max', // Use all CPU cores for clustering
    exec_mode: 'cluster', // Enable cluster mode for load distribution
    autorestart: true,
    watch: false,
    max_memory_restart: '4G', // Increased memory limit for high traffic
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Performance optimizations
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
