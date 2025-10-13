'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export const BottomNavContext = createContext();

export const useBottomNav = () => {
  const context = useContext(BottomNavContext);
  if (!context) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
};

export const BottomNavProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hideReasons, setHideReasons] = useState(new Set());

  const hideBottomNav = (reason) => {
    setHideReasons(prev => new Set([...prev, reason]));
    setIsVisible(false);
  };

  const showBottomNav = (reason) => {
    setHideReasons(prev => {
      const newReasons = new Set(prev);
      newReasons.delete(reason);
      return newReasons;
    });
    
    // Only show if no other reasons are hiding it
    if (hideReasons.size === 1) {
      setIsVisible(true);
    }
  };

  const forceShowBottomNav = () => {
    setHideReasons(new Set());
    setIsVisible(true);
  };

  const forceHideBottomNav = () => {
    setIsVisible(false);
  };

  return (
    <BottomNavContext.Provider
      value={{
        isVisible,
        hideBottomNav,
        showBottomNav,
        forceShowBottomNav,
        forceHideBottomNav,
        hideReasons: Array.from(hideReasons)
      }}
    >
      {children}
    </BottomNavContext.Provider>
  );
};
