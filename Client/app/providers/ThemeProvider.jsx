'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme Context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    try {
      // Get saved theme or detect system preference
      const savedTheme = localStorage.getItem('app_theme');
      
      if (savedTheme) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        try {
          const savedTheme = localStorage.getItem('app_theme');
          if (savedTheme === 'auto' || !savedTheme) {
            const newTheme = e.matches ? 'dark' : 'light';
            setThemeState(newTheme);
            applyTheme(newTheme);
          }
        } catch (error) {
          console.warn('Theme change handler error:', error);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.warn('Theme initialization error:', error);
      // Fallback to light theme
      setThemeState('light');
      applyTheme('light');
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  // Set theme
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      applyTheme(newTheme);
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

