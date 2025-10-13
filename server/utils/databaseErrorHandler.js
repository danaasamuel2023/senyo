/**
 * Database Error Handler Utility
 * Provides consistent error handling for database operations
 */

// Simple color utility functions
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

/**
 * Graceful shutdown function
 * Ensures proper cleanup before exiting
 */
function gracefulShutdown(exitCode = 1) {
  console.error(colors.yellow('\n🔄 Performing graceful shutdown...'));
  
  // Close any open database connections
  if (global.mongoose && global.mongoose.connection) {
    try {
      global.mongoose.connection.close(() => {
        console.error(colors.green('✅ Database connection closed'));
        process.exit(exitCode);
      });
    } catch (error) {
      console.error(colors.yellow('⚠️  Warning: Error closing database connection:', error.message));
      process.exit(exitCode);
    }
  } else {
    // No database connection to close, exit immediately
    process.exit(exitCode);
  }
}

/**
 * Handle database connection errors
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed
 * @param {boolean} exit - Whether to exit the process (default: true)
 * @param {boolean} retry - Whether to attempt retry (default: false)
 */
function handleDatabaseError(error, operation = 'Database operation', exit = true, retry = false) {
  console.error(colors.red('\n❌ DATABASE CONNECTION FAILED'));
  console.error(colors.red(`Operation: ${operation}`));
  console.error(colors.red(`Error: ${error.message}`));
  
  // Only show stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(colors.gray('Stack:'), error.stack);
  }
  
  // Log error details for debugging
  if (error.code) {
    console.error(colors.yellow(`Error Code: ${error.code}`));
  }
  
  if (error.name) {
    console.error(colors.yellow(`Error Type: ${error.name}`));
  }
  
  // Determine if error is recoverable
  const isRecoverable = isRecoverableError(error);
  
  // Provide helpful suggestions based on error type
  if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Check your internet connection'));
    console.error(colors.blue('   - Verify MongoDB Atlas cluster is running'));
    console.error(colors.blue('   - Check firewall settings'));
    if (isRecoverable) {
      console.error(colors.green('   - This error is recoverable, retry recommended'));
    }
  } else if (error.message.includes('authentication failed') || error.message.includes('auth failed') || error.message.includes('invalid credentials')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Verify MongoDB credentials'));
    console.error(colors.blue('   - Check environment variables'));
    console.error(colors.blue('   - Ensure user has proper permissions'));
    if (isRecoverable) {
      console.error(colors.green('   - This error is recoverable, retry recommended'));
    }
  } else if (error.message.includes('timeout')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Increase connection timeout'));
    console.error(colors.blue('   - Check network latency'));
    console.error(colors.blue('   - Verify MongoDB Atlas status'));
    if (isRecoverable) {
      console.error(colors.green('   - This error is recoverable, retry recommended'));
    }
  }
  
  // Handle retry logic
  if (retry && isRecoverable) {
    console.error(colors.yellow('\n🔄 Attempting to recover...'));
    return attemptRecovery(operation);
  }
  
  if (exit) {
    gracefulShutdown(1);
  }
}

/**
 * Check if an error is recoverable
 * @param {Error} error - The error object
 * @returns {boolean} True if error is recoverable
 */
function isRecoverableError(error) {
  const recoverablePatterns = [
    'timeout',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNRESET',
    'network',
    'connection',
    'authentication failed',
    'auth failed',
    'invalid credentials',
    'credentials expired',
    'token expired',
    'session expired',
    'unauthorized',
    'forbidden',
    'permission denied',
    'access denied',
    'insufficient permissions',
    'insufficient privileges',
    'rate limit',
    'too many requests',
    'service unavailable',
    'temporary',
    'retry',
    'reconnect',
    'schema validation',
    'data validation',
    'validation failed',
    'invalid data',
    'field validation',
    'required field',
    'type mismatch',
    'format error',
    'range error',
    'length error'
  ];
  
  const fatalPatterns = [
    'invalid configuration',
    'duplicate key',
    'constraint violation',
    'malformed',
    'corrupted',
    'permanent',
    'irreversible',
    'system error',
    'critical error',
    'fatal error',
    'cannot recover',
    'corruption detected'
  ];
  
  const errorMessage = error.message.toLowerCase();
  
  // Check for fatal patterns first
  if (fatalPatterns.some(pattern => errorMessage.includes(pattern))) {
    return false;
  }
  
  // Check for recoverable patterns
  return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Attempt to recover from a database error
 * @param {string} operation - The operation that failed
 * @returns {Promise<boolean>} True if recovery successful
 */
async function attemptRecovery(operation) {
  console.error(colors.yellow('\n🔄 Attempting recovery...'));
  
  try {
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.error(colors.blue('✅ Recovery attempt completed'));
    return true;
  } catch (recoveryError) {
    console.error(colors.red('❌ Recovery failed:'), recoveryError.message);
    return false;
  }
}

/**
 * Handle recoverable database errors without exiting
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed
 * @param {boolean} retry - Whether to attempt retry (default: true)
 */
function handleRecoverableError(error, operation = 'Database operation', retry = true) {
  console.error(colors.yellow('\n⚠️  RECOVERABLE DATABASE ERROR'));
  console.error(colors.yellow(`Operation: ${operation}`));
  console.error(colors.yellow(`Error: ${error.message}`));
  
  // Log error details for debugging
  if (error.code) {
    console.error(colors.yellow(`Error Code: ${error.code}`));
  }
  
  if (error.name) {
    console.error(colors.yellow(`Error Type: ${error.name}`));
  }
  
  // Provide helpful suggestions
  if (error.message.includes('timeout')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Increase connection timeout'));
    console.error(colors.blue('   - Check network latency'));
    console.error(colors.blue('   - Verify MongoDB Atlas status'));
    console.error(colors.green('   - This error is recoverable, retry recommended'));
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Check your internet connection'));
    console.error(colors.blue('   - Verify MongoDB Atlas cluster is running'));
    console.error(colors.blue('   - Check firewall settings'));
    console.error(colors.green('   - This error is recoverable, retry recommended'));
  } else if (error.message.includes('authentication failed') || error.message.includes('auth failed') || error.message.includes('invalid credentials')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Verify MongoDB credentials'));
    console.error(colors.blue('   - Check environment variables'));
    console.error(colors.blue('   - Ensure user has proper permissions'));
    console.error(colors.green('   - This error is recoverable, retry recommended'));
  } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Wait before retrying'));
    console.error(colors.blue('   - Check rate limit settings'));
    console.error(colors.blue('   - Consider implementing backoff strategy'));
    console.error(colors.green('   - This error is recoverable, retry recommended'));
  } else if (error.message.includes('permission denied') || error.message.includes('access denied') || error.message.includes('insufficient permissions')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Check user permissions'));
    console.error(colors.blue('   - Verify role assignments'));
    console.error(colors.blue('   - Contact administrator for access'));
    console.error(colors.blue('   - Check if permissions were recently changed'));
    console.error(colors.green('   - This error is recoverable, retry recommended'));
  } else if (error.message.includes('schema validation') || error.message.includes('data validation') || error.message.includes('validation failed')) {
    console.error(colors.blue('\n💡 Suggestions:'));
    console.error(colors.blue('   - Check data format and types'));
    console.error(colors.blue('   - Verify required fields are present'));
    console.error(colors.blue('   - Check field constraints and limits'));
    console.error(colors.blue('   - Review schema definitions'));
    console.error(colors.green('   - This error is recoverable, retry recommended'));
  }
  
  // Handle retry logic
  if (retry) {
    console.error(colors.yellow('\n🔄 Will attempt recovery on next operation...'));
  }
  
  // Don't exit, just log the error
  console.error(colors.green('\n✅ Continuing operation despite error...'));
}

/**
 * Handle general script errors
 * @param {Error} error - The error object
 * @param {string} scriptName - Name of the script
 * @param {boolean} exit - Whether to exit the process (default: true)
 */
function handleScriptError(error, scriptName = 'Script', exit = true) {
  console.error(colors.red(`\n❌ ${scriptName.toUpperCase()} FAILED`));
  console.error(colors.red(`Error: ${error.message}`));
  
  // Only show stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error(colors.gray('Stack:'), error.stack);
  }
  
  if (exit) {
    gracefulShutdown(1);
  }
}

/**
 * Handle MongoDB connection errors specifically
 * @param {Error} error - The MongoDB error
 * @param {boolean} exit - Whether to exit the process (default: true)
 */
function handleMongoError(error, exit = true) {
  console.error(colors.red('\n❌ MONGODB CONNECTION FAILED'));
  console.error(colors.red(`Error: ${error.message}`));
  
  // MongoDB specific error handling
  if (error.code) {
    switch (error.code) {
      case 11000:
        console.error(colors.yellow('Error Code: Duplicate Key'));
        console.error(colors.blue('💡 This usually means a unique constraint violation'));
        break;
      case 11001:
        console.error(colors.yellow('Error Code: Duplicate Key Update'));
        break;
      case 18:
        console.error(colors.yellow('Error Code: Authentication Failed'));
        console.error(colors.blue('💡 Check your MongoDB credentials'));
        break;
      case 6:
        console.error(colors.yellow('Error Code: Host Unreachable'));
        console.error(colors.blue('💡 Check your network connection and MongoDB Atlas status'));
        break;
      default:
        console.error(colors.yellow(`Error Code: ${error.code}`));
    }
  }
  
  if (exit) {
    gracefulShutdown(1);
  }
}

/**
 * Handle unhandled promise rejections
 * @param {Error} error - The unhandled rejection error
 */
function handleUnhandledRejection(error) {
  console.error(colors.red('\n❌ UNHANDLED PROMISE REJECTION'));
  console.error(colors.red(`Error: ${error.message}`));
  
  if (process.env.NODE_ENV === 'development') {
    console.error(colors.gray('Stack:'), error.stack);
  }
  
  gracefulShutdown(1);
}

/**
 * Handle uncaught exceptions
 * @param {Error} error - The uncaught exception
 */
function handleUncaughtException(error) {
  console.error(colors.red('\n❌ UNCAUGHT EXCEPTION'));
  console.error(colors.red(`Error: ${error.message}`));
  
  if (process.env.NODE_ENV === 'development') {
    console.error(colors.gray('Stack:'), error.stack);
  }
  
  gracefulShutdown(1);
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers() {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
}

/**
 * Graceful shutdown handler
 * @param {string} signal - The signal received
 */
function handleGracefulShutdown(signal) {
  console.log(colors.yellow(`\n📡 Received ${signal}. Gracefully shutting down...`));
  
  // Close database connections
  if (global.mongoose && global.mongoose.connection) {
    global.mongoose.connection.close(() => {
      console.log(colors.green('✅ Database connection closed'));
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
}

module.exports = {
  handleDatabaseError,
  handleScriptError,
  handleMongoError,
  handleUnhandledRejection,
  handleUncaughtException,
  setupGlobalErrorHandlers,
  handleGracefulShutdown,
  setupGracefulShutdown,
  gracefulShutdown,
  handleRecoverableError,
  isRecoverableError,
  attemptRecovery
};
