'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../compoenent/nav';
import MobileNav from './MobileNav';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Hide navbar on admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Don't render navbar on admin pages
  if (isAdminRoute) {
    return null;
  }
  
  // Use MobileNav for mobile devices
  if (isMobile) {
    return <MobileNav />;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;
