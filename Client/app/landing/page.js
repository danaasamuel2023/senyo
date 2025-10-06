'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Star,
  CheckCircle,
  Wifi,
  Smartphone,
  CreditCard,
  Headphones,
  Award,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Get your data bundles instantly after payment'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Safe and secure payment processing'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Competitive prices for all networks'
    }
  ];

  const networks = [
    { name: 'MTN', color: 'bg-yellow-500', description: 'Ghana\'s leading network' },
    { name: 'TELECEL', color: 'bg-blue-500', description: 'Reliable connectivity' },
    { name: 'AT', color: 'bg-purple-500', description: 'Fast data speeds' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UnlimitedData GH</h1>
                <p className="text-sm text-gray-600">Your Data Partner</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/store"
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <Store className="w-5 h-5" />
                <span>Visit Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl shadow-yellow-500/50 mb-8 transform rotate-3 hover:rotate-6 transition-transform">
            <Wifi className="w-10 h-10 text-black" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">
            UnlimitedData GH
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your one-stop shop for affordable data bundles. Get instant delivery, secure payments, and 24/7 support for all major networks in Ghana.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/store"
              className="flex items-center space-x-3 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-black rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Store className="w-6 h-6" />
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => router.push('/agent-signup')}
              className="flex items-center space-x-3 px-8 py-4 bg-black hover:bg-gray-800 text-yellow-400 rounded-xl font-bold text-lg transition-all transform hover:scale-105 border-2 border-yellow-500"
            >
              <Users className="w-6 h-6" />
              <span>Become an Agent</span>
            </button>
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center justify-center space-x-1 mt-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
            ))}
            <span className="text-white font-semibold ml-3 text-lg">5.0 (127+ reviews)</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose UnlimitedData GH?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the best data bundle experience with instant delivery, competitive prices, and reliable support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Major Networks</h2>
            <p className="text-xl text-gray-600">We support all major mobile networks in Ghana</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {networks.map((network, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <div className={`w-20 h-20 ${network.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{network.name}</h3>
                <p className="text-gray-600 mb-6">{network.description}</p>
                <Link
                  href="/store"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-semibold transition-all"
                >
                  <span>View Bundles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust UnlimitedData GH for their data needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/store"
              className="flex items-center space-x-3 px-8 py-4 bg-black hover:bg-gray-800 text-yellow-400 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              <Store className="w-6 h-6" />
              <span>Shop Data Bundles</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/agent-signup"
              className="flex items-center space-x-3 px-8 py-4 bg-white hover:bg-gray-100 text-black rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              <Users className="w-6 h-6" />
              <span>Join as Agent</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-gray-400">We're here to help you with all your data needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Phone</h4>
              <p className="text-gray-400">+233 24 123 4567</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Email</h4>
              <p className="text-gray-400">support@unlimiteddata.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-black" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Address</h4>
              <p className="text-gray-400">Accra, Ghana</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-black" />
              </div>
              <span className="text-white font-semibold">UnlimitedData GH</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/store" className="text-gray-400 hover:text-yellow-400 transition-colors">
                Store
              </Link>
              <Link href="/agent-signup" className="text-gray-400 hover:text-yellow-400 transition-colors">
                Become Agent
              </Link>
              <Link href="/SignIn" className="text-gray-400 hover:text-yellow-400 transition-colors">
                Login
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 UnlimitedData GH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
