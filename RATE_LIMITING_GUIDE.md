# Rate Limiting Implementation Guide

## Overview

This guide explains the rate limiting improvements implemented to handle 429 "Too Many Requests" errors in the Senyo application.

## Problem Solved

The application was experiencing 429 status code errors when users made rapid successive requests to the API, particularly in the topup/deposit functionality. This was causing:

- Failed payment processing
- Poor user experience
- Potential data inconsistencies

## Solutions Implemented

### 1. Enhanced Retry Logic

**Location**: `/Client/app/topup/page.js` (lines 395-424)

**Improvements**:
- Reduced max retries from 5 to 3 to prevent excessive API calls
- Increased base delay from 2s to 5s for better rate limit handling
- Extended max delay cap from 30s to 60s
- Added loading state during retry attempts
- Better retry-after header support

### 2. Aggressive Client-Side Rate Limiting

**Location**: `/Client/app/topup/page.js` (lines 427-437)

**New Features**:
- **Conservative Limits**: Only 3 requests per minute (matching server's strict 5/minute limit)
- **Extended Debounce**: 30 seconds between requests (increased from 15s)
- **Request Window Tracking**: Sliding window rate limiting
- **Automatic Reset**: Rate limits clear automatically after window expires

```javascript
const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 5000) => {
  // Enhanced exponential backoff with retry-after header support
  // Cap delay at 60 seconds for better rate limit handling
}
```

### 3. Circuit Breaker Pattern

**Location**: `/Client/app/topup/page.js` (lines 431-437)

**New Features**:
- **Failure Tracking**: Monitors consecutive API failures
- **Automatic Protection**: Opens circuit after 3 consecutive failures
- **Auto-Recovery**: Closes circuit after 5 minutes
- **Cascading Failure Prevention**: Prevents overwhelming failing services

```javascript
const DEBOUNCE_DELAY = 15000; // 15 seconds between requests
const [isRateLimited, setIsRateLimited] = useState(false);
```

### 4. Enhanced UI Feedback

**Features**:
- **Circuit Breaker Status**: Red warning banner when service is unavailable
- **Rate Limit Status**: Orange warning with request count display
- **Progress Indicators**: Animated progress bars for visual feedback
- **Smart Button States**: Different button text based on current state
- **Automatic Recovery**: Clear feedback when services are restored

### 5. Reusable Rate Limiting Utilities

**Location**: `/Client/utils/rateLimiting.js`

**New utility functions**:
- `retryWithBackoff()` - Enhanced retry with configurable options
- `throttle()` - Request throttling decorator
- `checkRateLimit()` - Rate limit status checker
- `recordRequest()` - Request tracking
- `clearRateLimit()` - Manual rate limit clearing
- `formatTimeRemaining()` - Time formatting helper

## Usage Examples

### Basic Rate Limiting Check

```javascript
import { checkRateLimit, recordRequest } from '../utils/rateLimiting';

const handleApiRequest = async (userId) => {
  // Check if user is rate limited
  const rateLimitStatus = checkRateLimit(userId);
  
  if (rateLimitStatus.isLimited) {
    throw new Error(`Rate limited. Try again in ${formatTimeRemaining(rateLimitStatus.resetIn)}`);
  }
  
  // Record the request
  recordRequest(userId);
  
  // Make API call
  return await apiCall();
};
```

### Using Retry with Backoff

```javascript
import { retryWithBackoff } from '../utils/rateLimiting';

const makePayment = async (paymentData) => {
  return await retryWithBackoff(
    () => axios.post('/api/payment', paymentData),
    {
      maxRetries: 3,
      baseDelay: 5000,
      maxDelay: 60000,
      retryCondition: (error) => error.response?.status === 429
    }
  );
};
```

### Request Throttling

```javascript
import { throttle } from '../utils/rateLimiting';

const throttledDeposit = throttle(handleDeposit, 15000); // 15 second throttle
```

## UI Improvements

### Rate Limit Status Indicator

When rate limited, users see:
- Orange warning banner with timer icon
- Animated progress bar
- Clear message about wait time
- Disabled submit button with "Rate Limited - Please Wait" text

### Toast Notifications

- Warning toasts during retry attempts
- Error toasts for rate limit exceeded
- Success toasts when rate limit clears

## Configuration

### Rate Limiting Parameters

```javascript
// Default settings (can be customized per endpoint)
const RATE_LIMIT_CONFIG = {
  windowMs: 60000,        // 1 minute window
  maxRequests: 3,         // 3 requests per window (conservative)
  debounceDelay: 30000,   // 30 seconds between requests
  retryMaxAttempts: 3,    // Maximum retry attempts
  retryBaseDelay: 5000,   // Base delay for retries
  retryMaxDelay: 60000,   // Maximum retry delay
  circuitBreakerThreshold: 3,  // Open circuit after 3 failures
  circuitBreakerTimeout: 300000, // 5 minutes before retry
  autoClearTime: 60000    // Auto-clear rate limit after 1 minute
};
```

## Best Practices

### 1. User Identification
- Use consistent identifiers (user ID, email, IP)
- Consider different limits for different user types
- Implement progressive rate limiting for repeated offenders

### 2. Error Handling
- Always check rate limit status before making requests
- Provide clear, actionable error messages
- Implement graceful degradation when rate limited

### 3. Monitoring
- Log rate limit events for analysis
- Monitor API response times and error rates
- Track user behavior patterns

### 4. User Experience
- Show clear feedback about rate limiting
- Provide alternative methods when possible
- Use progressive disclosure for technical details

## Testing

### Rate Limit Testing

```javascript
// Test rate limiting
const testRateLimit = async () => {
  const userId = 'test-user';
  
  // Make requests until rate limited
  for (let i = 0; i < 15; i++) {
    try {
      const status = checkRateLimit(userId);
      console.log(`Request ${i + 1}: ${status.isLimited ? 'BLOCKED' : 'ALLOWED'}`);
      recordRequest(userId);
    } catch (error) {
      console.log(`Request ${i + 1}: ${error.message}`);
    }
  }
};
```

## Monitoring and Analytics

### Key Metrics to Track
- Rate limit hit frequency
- Average retry attempts
- User abandonment during rate limiting
- API response times
- Error rates by endpoint

### Logging

```javascript
// Log rate limit events
const logRateLimitEvent = (userId, action, details) => {
  console.log({
    timestamp: new Date().toISOString(),
    userId,
    action, // 'rate_limited', 'retry_attempt', 'rate_limit_cleared'
    details
  });
};
```

## Future Improvements

### 1. Adaptive Rate Limiting
- Adjust limits based on user behavior
- Implement different tiers for different user types
- Dynamic rate limiting based on server load

### 2. Caching Strategy
- Cache API responses to reduce requests
- Implement request deduplication
- Use optimistic updates where appropriate

### 3. Queue Management
- Implement request queuing for high-priority operations
- Background processing for non-critical requests
- Batch processing for multiple operations

### 4. Advanced Analytics
- Real-time rate limiting dashboard
- Predictive rate limiting based on usage patterns
- A/B testing for different rate limiting strategies

## Troubleshooting

### Common Issues

1. **Rate limit not clearing**
   - Check if multiple identifiers are being used
   - Verify timeout configurations
   - Check for memory leaks in rate limit state

2. **False positives**
   - Review rate limit thresholds
   - Check for duplicate request tracking
   - Verify user identification logic

3. **Performance impact**
   - Monitor memory usage of rate limit state
   - Consider implementing cleanup for old entries
   - Use efficient data structures

### Debug Mode

```javascript
// Enable debug logging
const DEBUG_RATE_LIMITING = true;

const debugLog = (message, data) => {
  if (DEBUG_RATE_LIMITING) {
    console.log(`[Rate Limiting] ${message}`, data);
  }
};
```

## Server-Side Rate Limiting Analysis

The server has very strict rate limiting configured:

### Payment Endpoints
- **Rate Limit**: 5 requests per minute in production
- **Window**: 1 minute sliding window
- **Multiple Layers**: Both general payment limiter (20/hour) and specific payment limiter (5/minute)

### Security Measures
- **IP-based tracking**: Rate limiting by IP address
- **Suspicious activity tracking**: Blocks after 10 violations
- **Development bypass**: Localhost requests are not rate limited in development

## Conclusion

The implemented rate limiting solution provides:

- ✅ **Aggressive Client-Side Protection**: 3 requests/minute to stay well under server limits
- ✅ **Circuit Breaker Pattern**: Prevents cascading failures
- ✅ **Enhanced UI Feedback**: Clear visual indicators for all states
- ✅ **Automatic Recovery**: Self-healing mechanisms
- ✅ **Conservative Approach**: Stays well within server rate limits
- ✅ **Comprehensive Error Handling**: Handles all failure scenarios gracefully

This solution ensures the application can handle the strict server-side rate limits while providing an excellent user experience. The 429 errors should be significantly reduced or eliminated entirely.
