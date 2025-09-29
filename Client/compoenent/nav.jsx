'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LayoutDashboard, 
  Layers, 
  User,
  CreditCard,
  LogOut,
  ChevronRight,
  ShoppingCart,
  BarChart2,
  Menu,
  X,
  Zap,
  Sparkles,
  Activity,
  TrendingUp,
  Settings,
  Wallet,
  Globe,
  Shield,
  ArrowRight,
  Star,
  Flame,
  Phone,
  MessageSquare,
  Bell,
  Package,
  Sun,
  Moon
} from 'lucide-react';

const MobileNavbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [userRole, setUserRole] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [theme, setTheme] = useState('light');
  
  // Initialize theme on component mount
  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Check user role and login status on initial load
  useEffect(() => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const dataUser = JSON.parse(localStorage.getItem('data.user') || '{}');
      
      const loggedIn = !!authToken;
      setIsLoggedIn(loggedIn);
      
      if (!loggedIn) return;
      
      if (userData?.role) {
        setUserRole(userData.role);
        setUserName(userData.name || '');
      } else if (dataUser?.role) {
        setUserRole(dataUser.role);
        setUserName(dataUser.name || '');
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setIsLoggedIn(false);
    }
  }, []);

  // Enhanced Logout function
  const handleLogout = () => {
    console.log("Logout initiated");
    try {
      ['authToken', 'userData', 'data.user', 'user', 'token'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      setIsLoggedIn(false);
      setUserRole("user");
      
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = '/';
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navigate to profile page
  const navigateToProfile = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Navigation Item Component - Modern Red Theme
  const NavItem = ({ icon, text, path, onClick, disabled = false, badge = null, isActive = false, isNew = false }) => {
    const itemClasses = `relative flex items-center py-4 px-6 ${
      disabled 
        ? 'opacity-40 cursor-not-allowed' 
        : 'hover:bg-gradient-to-r hover:from-transparent hover:to-red-500/5 cursor-pointer active:scale-[0.98]'
    } transition-all duration-300 group ${
      isActive ? 'bg-gradient-to-r from-transparent to-red-500/10 border-r-3 border-red-500' : ''
    }`;
    
    return (
      <div 
        className={itemClasses}
        onClick={() => {
          if (disabled) return;
          if (onClick) {
            onClick();
          } else {
            router.push(path);
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <div className={`mr-4 transition-all duration-300 ${
          isActive ? 'text-red-500 scale-110' : 'text-gray-500 group-hover:text-red-400'
        }`}>
          {icon}
        </div>
        <span className={`font-medium text-[15px] flex-1 transition-colors ${
          isActive ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
        }`}>
          {text}
        </span>
        {badge && (
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full uppercase tracking-wider shadow-sm">
            {badge}
          </span>
        )}
        {isNew && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full animate-pulse">
            NEW
          </span>
        )}
        {disabled && (
          <span className="px-2.5 py-0.5 text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
            Soon
          </span>
        )}
        {!disabled && !isActive && (
          <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
        )}
      </div>
    );
  };

  // Section Heading Component - Clean Red Accent
  const SectionHeading = ({ title, icon }) => (
    <div className="px-6 py-3 mb-2 flex items-center">
      {icon && (
        <div className="mr-2 text-red-400">
          {icon}
        </div>
      )}
      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {title}
      </p>
    </div>
  );

  return (
    <>
      {/* Fixed Header - Modern Glass Effect */}
      <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm z-40 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex justify-between items-center h-16 px-4 max-w-screen-xl mx-auto">
          <div className="flex items-center">
            <span 
              className="cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-2 h-2 text-white" strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-black bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
                    Unlimited Data Gh
                  </h1>
                  <p className="text-[10px] text-gray-500 font-medium -mt-1">Premium Data Services</p>
                </div>
              </div>
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon size={20} className="text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button>
            
            {isLoggedIn && notifications > 0 && (
              <button className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300">
                <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              </button>
            )}
            
            <button 
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all duration-300 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Modern Slide Design */}
      <aside 
        className={`fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-950 shadow-2xl transform transition-all duration-500 ease-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header - Premium Design */}
        <div className="relative border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-red-50/30 dark:from-gray-900 dark:to-red-950/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5" />
          
          <div className="relative flex justify-between items-center p-4 px-6">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Navigation</h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-95"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* User Info Section - Premium Card */}
          {isLoggedIn && (
            <div className="relative px-6 pb-6">
              <div 
                className="flex items-center p-4 bg-gradient-to-r from-white to-red-50 dark:from-gray-800 dark:to-red-950/30 rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 border border-red-100 dark:border-red-900/50 group"
                onClick={navigateToProfile}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
                    <User size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {userName || 'My Account'}
                  </div>
                  <div className="text-sm text-red-500 font-medium">View Profile</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content - Premium Layout */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto">
          {isLoggedIn ? (
            <div className="py-4">
              <SectionHeading title="Main Menu" icon={<Home size={14} />} />
              <NavItem 
                icon={<LayoutDashboard size={20} />} 
                text="Dashboard" 
                path="/" 
                isActive={activeSection === "Dashboard"}
              />
              {userRole === "admin" && (
                <NavItem 
                  icon={<Shield size={20} />} 
                  text="Admin Panel" 
                  path="/admin" 
                  badge="Admin"
                />
              )}

              <div className="my-6">
                <SectionHeading title="Data Services" icon={<Activity size={14} />} />
                <NavItem 
                  icon={<Globe size={20} />} 
                  text="AirtelTigo" 
                  path="/at-ishare" 
                />
                <NavItem 
                  icon={<Phone size={20} />} 
                  text="MTN Data" 
                  path="/mtnup2u" 
                />
                <NavItem 
                  icon={<Layers size={20} />} 
                  text="Telecel" 
                  path="/TELECEL"
                  isNew={true}
                />
                <NavItem 
                  icon={<Package size={20} />} 
                  text="Bulk Purchase" 
                  path="/bulk-purchase"
                  badge="HOT"
                />
                <NavItem 
                  icon={<Sparkles size={20} />} 
                  text="AT Big Time" 
                  path="/at-big-time"
                  disabled={true} 
                />
              </div>

              <div className="my-6">
                <SectionHeading title="Finance" icon={<Wallet size={14} />} />
                <NavItem 
                  icon={<CreditCard size={20} />} 
                  text="Top Up Wallet" 
                  path="/topup" 
                />
                <NavItem 
                  icon={<ShoppingCart size={20} />} 
                  text="Transactions" 
                  path="/myorders" 
                />
                <NavItem 
                  icon={<TrendingUp size={20} />} 
                  text="Analytics" 
                  path="/analytics" 
                />
              </div>

              <div className="my-6">
                <SectionHeading title="Support & More" icon={<MessageSquare size={14} />} />
                <NavItem 
                  icon={<BarChart2 size={20} />} 
                  text="Reports" 
                  path="/reports"
                  disabled={true}
                />
                <NavItem 
                  icon={<Settings size={20} />} 
                  text="Settings" 
                  path="/settings"
                />
                <NavItem 
                  icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} 
                  text={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
                  onClick={toggleTheme}
                  badge={theme === 'dark' ? 'DARK' : 'LIGHT'}
                />
                <NavItem 
                  icon={<MessageSquare size={20} />} 
                  text="Help Center" 
                  path="/help"
                />
              </div>

              {/* Premium Features Banner */}
              <div className="mx-6 my-6 p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl text-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">Unlock Premium</h3>
                    <p className="text-xs opacity-90 mb-3">Get unlimited data transfers and exclusive deals</p>
                    <button className="px-3 py-1.5 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all duration-300">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout Button - Premium Style */}
              <div className="mt-8 px-6 pb-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-3.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-300 font-semibold group"
                >
                  <LogOut size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            // Not logged in state - Premium Welcome
            <div className="p-6 flex flex-col items-center justify-center h-full bg-gradient-to-b from-transparent to-red-50/20 dark:to-red-950/10">
              <div className="text-center mb-8 max-w-xs">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30">
                    <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl font-black bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent mb-3">
                  Welcome to Unlimited Data Gh
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Your premium gateway to unlimited data services and exclusive offers
                </p>
              </div>
              
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={() => {
                    router.push('/SignIn');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 font-bold transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>
                
                <button
                  onClick={() => {
                    router.push('/SignUp');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 px-4 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 font-bold"
                >
                  Create Account
                </button>
                
                <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs mt-4">
                  <Flame className="w-3 h-3 text-red-400" />
                  <span>Join thousands of data hustlers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pt-16">
        {/* Your content goes here */}
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 3px;
          opacity: 0.3;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #dc2626;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
          opacity: 1;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }

        /* Smooth animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        /* Theme transition animation */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default MobileNavbar;