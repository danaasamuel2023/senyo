'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../component/nav.jsx';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Hide navbar on admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Don't render navbar on admin pages
  if (isAdminRoute) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;
