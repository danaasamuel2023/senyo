import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '../utils/auth';

/**
 * Custom hook for real-time balance updates
 * Polls the server for balance updates and triggers UI updates
 */
export const useBalanceUpdate = (userId, enabled = true) => {
  const [balanceUpdate, setBalanceUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const checkForBalanceUpdate = useCallback(async () => {
    if (!userId || !enabled) return;

    try {
      const authToken = getAuthToken();
      if (!authToken) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
      const response = await fetch(`${API_URL}/api/balance-update/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.hasUpdate) {
          console.log('💰 Balance update received:', data.data);
          setBalanceUpdate(data.data);
          setLastUpdateTime(new Date().toISOString());
          
          // Update localStorage with new balance
          try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const updatedUserData = {
              ...userData,
              walletBalance: data.data.newBalance
            };
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
            
            // Dispatch custom event for other components to listen
            window.dispatchEvent(new CustomEvent('balanceUpdated', {
              detail: {
                newBalance: data.data.newBalance,
                reference: data.data.reference,
                amount: data.data.amount,
                timestamp: data.data.timestamp
              }
            }));
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error checking balance update:', error);
    }
  }, [userId, enabled]);

  // Start polling for balance updates
  useEffect(() => {
    if (!userId || !enabled) return;

    setIsPolling(true);
    
    // Check immediately
    checkForBalanceUpdate();
    
    // Set up polling every 10 seconds
    const interval = setInterval(checkForBalanceUpdate, 10000);
    
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [userId, enabled, checkForBalanceUpdate]);

  // Listen for balance update events from other components
  useEffect(() => {
    const handleBalanceUpdate = (event) => {
      console.log('💰 Balance update event received:', event.detail);
      setBalanceUpdate(event.detail);
      setLastUpdateTime(new Date().toISOString());
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, []);

  return {
    balanceUpdate,
    isPolling,
    lastUpdateTime,
    checkForBalanceUpdate
  };
};

export default useBalanceUpdate;
