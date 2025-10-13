// Circuit breaker utility for handling API failures
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Start monitoring
    this.startMonitoring();
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      console.log(`🔴 Circuit breaker OPENED after ${this.failureCount} failures`);
    }
  }
  
  startMonitoring() {
    setInterval(() => {
      if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTime) {
        this.state = 'HALF_OPEN';
        console.log('🟡 Circuit breaker moved to HALF_OPEN state');
      }
    }, this.monitoringPeriod);
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }
}

// Create a global circuit breaker for login API
const loginCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  timeout: 30000,
  resetTimeout: 60000
});

export { CircuitBreaker, loginCircuitBreaker };
