'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingCart, Zap, Wifi, Phone, ArrowRight, CheckCircle,
  AlertCircle, X, Loader2, Star, Award, Shield, Home,
  Package, User, Mail, ChevronRight, MessageCircle,
  Facebook, Twitter, Instagram, TrendingUp, Sparkles,
  Heart, Share2, MapPin, Clock, BadgeCheck, Globe,
  Smartphone, CreditCard, Lock, Truck, Headphones
} from 'lucide-react';
import { getApiEndpoint } from '../../utils/apiConfig';

const StorePage = () => {
  // Simplified version for testing
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Store Page</h1>
        <p className="text-gray-600">Store is loading...</p>
      </div>
    </div>
  );
};

// Wrapper component with Suspense boundary
const StorePageWithSuspense = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-400 font-medium">Loading store...</p>
        </div>
      </div>
    }>
      <StorePage />
    </Suspense>
  );
};

export default StorePageWithSuspense;