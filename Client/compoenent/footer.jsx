import React from 'react';
import { ArrowRight, Flame, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = ({ hideOnAdmin = true }) => {
  const currentYear = new Date().getFullYear();
  
  // Check if current path is admin dashboard
  const isAdminPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path.includes('/admin') || path.includes('/dashboard/admin') || path.startsWith('/admin/');
    }
    return false;
  };

  // Don't render footer on admin pages if hideOnAdmin is true
  if (hideOnAdmin && isAdminPath()) {
    return null;
  }
  
  const socialLinks = [
    { platform: 'twitter', icon: Twitter, href: '#' },
    { platform: 'instagram', icon: Instagram, href: '#' },
    { platform: 'facebook', icon: Facebook, href: '#' },
    { platform: 'linkedin', icon: Linkedin, href: '#' }
  ];

  const quickLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Orders', path: '/orders' },
    { name: 'Transactions', path: '/myorders' },
    { name: 'Profile', path: '/profile' }
  ];

  const services = [
    { name: 'MTN Data', path: '/mtnup2u' },
    { name: 'AirtelTigo Data', path: '/at-ishare' },
    { name: 'Telecel Data', path: '/TELECEL', badge: 'New' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-yellow-950/20 to-gray-950 border-t border-gray-800 z-10">
      {/* Minimal Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-yellow-500/5 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-gradient-to-br from-white/3 to-[#FFCC08]/5 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section - Compact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              {/* Smaller Logo */}
              <div className="mb-3 flex items-center space-x-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFCC08] to-yellow-600 shadow-md shadow-[#FFCC08]/20">
                  <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10" strokeWidth="2" fill="none"/>
                    <path d="M9 12l1.5-3 1.5 3 1.5-3 1.5 3" strokeWidth="2.5" fill="none"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <h2 className="bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-white bg-clip-text text-base font-black text-transparent">
                  Unlimited Data GH
                </h2>
              </div>
              
              <p className="mb-3 text-xs text-gray-400">
                Where Hustlers Meet Success
              </p>
              
              {/* Compact Social Links */}
              <div className="flex space-x-1.5">
                {socialLinks.map(({ platform, icon: Icon, href }) => (
                  <a 
                    key={platform}
                    href={href}
                    aria-label={platform}
                    className="group flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-[#FFCC08]/50 hover:bg-[#FFCC08]/10"
                  >
                    <Icon className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-[#FFCC08]" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Links - Compact */}
          <div>
            <h3 className="mb-2 flex items-center text-xs font-bold text-white">
              <div className="mr-1.5 h-3 w-0.5 rounded-full bg-gradient-to-b from-[#FFCC08] to-yellow-600" />
              Quick Links
            </h3>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.path} 
                    className="group flex items-center text-xs text-gray-400 transition-colors hover:text-[#FFCC08]"
                  >
                    <ArrowRight className="mr-1.5 h-2.5 w-2.5 text-[#FFCC08] opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services - Compact */}
          <div>
            <h3 className="mb-2 flex items-center text-xs font-bold text-white">
              <div className="mr-1.5 h-3 w-0.5 rounded-full bg-gradient-to-b from-yellow-400 to-[#FFCC08]" />
              Services
            </h3>
            <ul className="space-y-1.5">
              {services.map((service) => (
                <li key={service.name}>
                  <a 
                    href={service.path} 
                    className="group flex items-center text-xs text-gray-400 transition-colors hover:text-[#FFCC08]"
                  >
                    <ArrowRight className="mr-1.5 h-2.5 w-2.5 text-[#FFCC08] opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>
                      {service.name}
                      {service.badge && (
                        <span className="ml-1 rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-600 px-1.5 py-0.5 text-[8px] font-bold text-black">
                          {service.badge}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter - Minimal */}
          <div>
            <h3 className="mb-2 flex items-center text-xs font-bold text-white">
              <div className="mr-1.5 h-3 w-0.5 rounded-full bg-gradient-to-b from-white to-[#FFCC08]" />
              Stay Updated
            </h3>
            <p className="mb-2 text-[10px] text-gray-500">
              Get exclusive offers
            </p>
            <div className="space-y-1.5">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 focus:border-[#FFCC08]/50 focus:outline-none focus:ring-1 focus:ring-[#FFCC08]/50"
              />
              <button
                type="button"
                className="w-full rounded-lg bg-gradient-to-r from-[#FFCC08] to-yellow-600 px-2.5 py-1.5 text-[11px] font-semibold text-black shadow-md shadow-[#FFCC08]/20 transition-all hover:shadow-lg"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Compact Bottom Section */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex flex-col items-center justify-between space-y-2 text-center sm:flex-row sm:space-y-0 sm:text-left">
            <p className="text-[10px] text-gray-500">
              © {currentYear} UNLIMITED DATA GH
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:gap-3">
              <a href="/privacy" className="text-gray-500 transition-colors hover:text-[#FFCC08]">
                Privacy
              </a>
              <a href="/terms" className="text-gray-500 transition-colors hover:text-[#FFCC08]">
                Terms
              </a>
              <div className="flex items-center space-x-1 text-[#FFCC08]">
                <Flame className="h-3 w-3" />
                <span className="font-bold">Keep Hustling!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;