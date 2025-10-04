// components/Footer.jsx
'use client'
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Star, Flame, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
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
    { name: 'MTN Data', path: '/mtnup2u', accent: 'yellow' },
    { name: 'AirtelTigo Data', path: '/at-ishare', accent: 'blue' },
    { name: 'Telecel Data', path: '/TELECEL', accent: 'red', badge: 'New' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-yellow-950/20 to-gray-950">
      {/* Animated Background Orbs - Updated to MTN Yellow theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-[#FFCC08]/10 to-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-white/5 to-[#FFCC08]/10 blur-3xl delay-700" />
        <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-[#FFCC08]/5 to-white/5 blur-2xl delay-1000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              {/* Logo - Updated to match new design */}
              <div className="mb-6 flex items-center space-x-3">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFCC08] to-yellow-600 shadow-2xl shadow-[#FFCC08]/25 transform rotate-2 hover:rotate-4 transition-transform duration-300">
                  <svg className="h-7 w-7 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    {/* Wi-Fi signal curves - outer arcs */}
                    <path d="M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10" strokeWidth="2" fill="none"/>
                    <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeWidth="2" fill="none"/>
                    
                    {/* Inner signal curves */}
                    <path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeWidth="2" fill="none"/>
                    <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeWidth="2" fill="none"/>
                    
                    {/* Central geometric shape - stylized M/W */}
                    <path d="M9 12l1.5-3 1.5 3 1.5-3 1.5 3" strokeWidth="2.5" fill="none"/>
                    
                    {/* Distinctive curved elements from the design */}
                    <path d="M12 9c1.5 0 2.5 1 2.5 2.5c0 1.5-1 2.5-2.5 2.5" strokeWidth="2" fill="none"/>
                    <path d="M12 15c-1.5 0-2.5-1-2.5-2.5c0-1.5 1-2.5 2.5-2.5" strokeWidth="2" fill="none"/>
                    
                    {/* Additional curved elements */}
                    <path d="M9 12c0-1.1.9-2 2-2s2 .9 2 2" strokeWidth="2" fill="none"/>
                    
                    {/* Central dot */}
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <h2 className="bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-white bg-clip-text text-3xl font-black tracking-tight text-transparent">
                  Unlimited Data GH
                </h2>
              </div>
              
              <p className="mb-8 text-lg font-medium leading-relaxed text-gray-300">
                Where Hustlers Meet Success. Your premium data marketplace for unlimited possibilities.
              </p>
              
              {/* Social Media Links - Updated hover effects */}
              <div className="flex space-x-3">
                {socialLinks.map(({ platform, icon: Icon, href }) => (
                  <a 
                    key={platform}
                    href={href}
                    aria-label={`Follow us on ${platform}`}
                    className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-[#FFCC08]/50 hover:bg-[#FFCC08]/10"
                  >
                    <Icon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-[#FFCC08]" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="mb-6 flex items-center text-xl font-bold text-white">
              <div className="mr-3 h-7 w-1.5 rounded-full bg-gradient-to-b from-[#FFCC08] to-yellow-600" />
              Quick Links
            </h3>
            <nav>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.path} 
                      className="group flex items-center font-medium text-gray-300 transition-all duration-300 hover:text-[#FFCC08]"
                    >
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 transition-all duration-300 group-hover:bg-[#FFCC08]/20">
                        <ArrowRight className="h-3.5 w-3.5 text-[#FFCC08] opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Data Services */}
          <div>
            <h3 className="mb-6 flex items-center text-xl font-bold text-white">
              <div className="mr-3 h-7 w-1.5 rounded-full bg-gradient-to-b from-yellow-400 to-[#FFCC08]" />
              Our Services
            </h3>
            <nav>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link 
                      href={service.path} 
                      className="group flex items-center font-medium text-gray-300 transition-all duration-300 hover:text-[#FFCC08]"
                    >
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 transition-all duration-300 group-hover:bg-[#FFCC08]/20">
                        <ArrowRight className="h-3.5 w-3.5 text-[#FFCC08] opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
                        {service.name}
                        {service.badge && (
                          <span className="ml-2 animate-pulse rounded-full bg-gradient-to-r from-[#FFCC08] to-yellow-600 px-2 py-0.5 text-[10px] font-bold text-black shadow-lg shadow-[#FFCC08]/25">
                            {service.badge}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="mb-6 flex items-center text-xl font-bold text-white">
              <div className="mr-3 h-7 w-1.5 rounded-full bg-gradient-to-b from-white to-[#FFCC08]" />
              Stay Updated
            </h3>
            <p className="mb-4 text-sm text-gray-300">
              Get exclusive offers and updates straight to your inbox.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-[#FFCC08]/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#FFCC08]/50"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-[#FFCC08] to-yellow-600 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#FFCC08]/25 transition-all duration-300 hover:from-yellow-500 hover:to-[#FFCC08] hover:shadow-xl hover:shadow-[#FFCC08]/30"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-gray-400">
                © {currentYear} UNLIMITED DATA GH. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="font-medium text-gray-400 transition-colors duration-300 hover:text-[#FFCC08]"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="font-medium text-gray-400 transition-colors duration-300 hover:text-[#FFCC08]"
              >
                Terms of Service
              </Link>
              <div className="flex items-center space-x-2 text-[#FFCC08]">
                <Flame className="h-4 w-4 animate-bounce" />
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