
// useLogin.js
import { useState } from 'react';
import { loginWithFallback, storeLoginData, clearLoginData } from '../utils/loginBypass';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const result = await loginWithFallback(email, password);
      
      if (result.success) {
        storeLoginData(result.data);
        return { success: true, data: result.data };
      } else {
        setError('Login failed. Please try again.');
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearLoginData();
  };

  return { login, logout, loading, error };
}
