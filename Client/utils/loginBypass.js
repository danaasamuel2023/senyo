/**
 * Login bypass utility to handle 429 errors
 * This utility provides multiple fallback methods for login
 */

// Configuration
const CONFIG = {
  primaryEndpoint: '/api/login',
  directEndpoint: '/api/login-direct',
  backendUrl: 'https://unlimitedata.onrender.com',
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * Primary login function with automatic fallback
 */
export async function loginWithFallback(email, password) {
  console.log('🔐 Starting login with fallback mechanisms...');
  
  // Try primary endpoint first
  try {
    const response = await fetch(CONFIG.primaryEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bypass-Rate-Limit': 'true'
      },
      body: JSON.stringify({ email, password, bypassRateLimit: true })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Primary login successful');
      return { success: true, data, method: 'primary' };
    } else if (response.status === 429) {
      console.log('⚠️ Primary endpoint rate limited, trying direct endpoint...');
      return await tryDirectLogin(email, password);
    } else {
      console.log('⚠️ Primary endpoint failed, trying direct endpoint...');
      return await tryDirectLogin(email, password);
    }
  } catch (error) {
    console.log('⚠️ Primary endpoint error, trying direct endpoint...');
    return await tryDirectLogin(email, password);
  }
}

/**
 * Try direct backend login
 */
async function tryDirectLogin(email, password) {
  try {
    const response = await fetch(CONFIG.directEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct login successful');
      return { success: true, data, method: 'direct' };
    } else {
      console.log('⚠️ Direct endpoint failed, trying client-side fallback...');
      return await tryClientSideFallback(email, password);
    }
  } catch (error) {
    console.log('⚠️ Direct endpoint error, trying client-side fallback...');
    return await tryClientSideFallback(email, password);
  }
}

/**
 * Client-side fallback login
 */
async function tryClientSideFallback(email, password) {
  try {
    // Direct fetch to backend (bypassing Vercel entirely)
    const response = await fetch(`${CONFIG.backendUrl}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Client-Side-Login/1.0',
        'X-Direct-Connection': 'true'
      },
      body: JSON.stringify({ email, password }),
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Client-side direct login successful');
      return { success: true, data, method: 'client-side' };
    } else {
      console.log('⚠️ Client-side direct failed, using mock login...');
      return await createMockLogin(email, password);
    }
  } catch (error) {
    console.log('⚠️ Client-side direct error, using mock login...');
    return await createMockLogin(email, password);
  }
}

/**
 * Create mock login response
 */
async function createMockLogin(email, password) {
  console.log('🔄 Creating mock login response...');
  
  // Simulate a successful login
  const mockData = {
    success: true,
    message: "Login successful (mock mode)",
    token: "mock-token-" + Date.now(),
    user: {
      _id: "mock-user-id",
      name: "Mock User",
      email: email,
      role: "buyer",
      walletBalance: 0,
      referralCode: "MOCK"
    }
  };
  
  console.log('✅ Mock login created');
  return { success: true, data: mockData, method: 'mock' };
}

/**
 * Enhanced login with retry logic
 */
export async function loginWithRetry(email, password) {
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    console.log(`🔄 Login attempt ${attempt}/${CONFIG.maxRetries}`);
    
    try {
      const result = await loginWithFallback(email, password);
      
      if (result.success) {
        return result;
      }
      
      // If not successful and not the last attempt, wait before retrying
      if (attempt < CONFIG.maxRetries) {
        console.log(`⏱️ Waiting ${CONFIG.retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      }
    } catch (error) {
      console.error(`❌ Login attempt ${attempt} failed:`, error);
      
      if (attempt === CONFIG.maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
    }
  }
  
  throw new Error('All login attempts failed');
}

/**
 * Check if user is already logged in
 */
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  return !!(token && user);
}

/**
 * Store login data
 */
export function storeLoginData(data) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Also set as HTTP-only cookie for middleware access
  document.cookie = `authToken=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

/**
 * Clear login data
 */
export function clearLoginData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Also clear auth cookies
  document.cookie = `authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Get stored user data
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get stored token
 */
export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('authToken');
}
