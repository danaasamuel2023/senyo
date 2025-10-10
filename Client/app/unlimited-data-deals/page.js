'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Infinity, 
  Zap, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Wifi,
  Signal,
  Globe,
  TrendingUp,
  Award,
  Users,
  Phone,
  Database,
  CreditCard,
  Lock,
  Timer,
  Gift,
  Sparkles,
  Flame,
  Target,
  DollarSign,
  Package,
  ShoppingCart,
  Heart,
  ThumbsUp,
  Rocket,
  Crown,
  Gem,
  Trophy,
  Medal,
  Badge,
  StarIcon,
  WifiIcon,
  Smartphone,
  Battery,
  WifiOff
} from 'lucide-react';

// Metadata is handled by layout.js for client components

const UnlimitedDataDealsPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <Infinity className="w-6 h-6" />,
      title: "True Unlimited",
      description: "No data caps or throttling. Use as much data as you need without restrictions."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "4G/5G speeds with unlimited data. Stream, download, and browse without limits."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Bank-level security with 99.9% uptime guarantee. Your data is always protected."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Activation",
      description: "Get unlimited data instantly after payment. No waiting, no delays."
    }
  ];

  const unlimitedPackages = [
    {
      name: "MTN Unlimited",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      icon: <Smartphone className="w-8 h-8" />,
      description: "Ghana's leading network with unlimited data",
      price: "₵50",
      validity: "30 days",
      features: ["Unlimited 4G data", "No speed throttling", "Nationwide coverage", "24/7 support"]
    },
    {
      name: "Vodafone Unlimited",
      color: "bg-red-500",
      textColor: "text-red-600",
      icon: <Signal className="w-8 h-8" />,
      description: "Fast unlimited data with excellent speeds",
      price: "₵45",
      validity: "30 days",
      features: ["Unlimited 4G data", "Premium speeds", "Reliable network", "Instant activation"]
    },
    {
      name: "AirtelTigo Unlimited",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      icon: <Wifi className="w-8 h-8" />,
      description: "Affordable unlimited data packages",
      price: "₵40",
      validity: "30 days",
      features: ["Unlimited 4G data", "Great value", "Fast speeds", "Wide coverage"]
    },
    {
      name: "Telecel Unlimited",
      color: "bg-green-500",
      textColor: "text-green-600",
      icon: <Globe className="w-8 h-8" />,
      description: "Competitive unlimited data rates",
      price: "₵42",
      validity: "30 days",
      features: ["Unlimited 4G data", "Competitive pricing", "Good coverage", "Reliable service"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mensah",
      location: "Accra",
      rating: 5,
      text: "Finally found true unlimited data! No more worrying about data limits. Perfect for streaming and work."
    },
    {
      name: "Kwame Osei",
      location: "Kumasi",
      rating: 5,
      text: "Best unlimited data deal in Ghana. Fast speeds, no throttling, and excellent customer service."
    },
    {
      name: "Ama Serwaa",
      location: "Tamale",
      rating: 5,
      text: "Unlimited data that actually works! No hidden limits or speed restrictions. Highly recommended!"
    }
  ];

  const benefits = [
    {
      icon: <WifiIcon className="w-8 h-8" />,
      title: "No Data Limits",
      description: "Use as much data as you need without any restrictions or overage charges."
    },
    {
      icon: <Battery className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Your unlimited data is available 24/7. No downtime, no interruptions."
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Premium Speeds",
      description: "Enjoy 4G/5G speeds with unlimited data. Perfect for streaming and gaming."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Connection",
      description: "Bank-level encryption and security for all your unlimited data usage."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white dark:from-black dark:via-blue-900/10 dark:to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6">
              <Infinity className="w-4 h-4 mr-2" />
              #1 Unlimited Data Platform in Ghana
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-blue-600 dark:text-blue-400">Unlimited Data</span>
              <br />
              Deals Ghana
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Get <span className="font-bold text-blue-600 dark:text-blue-400">true unlimited data</span> packages 
              starting from just <span className="font-bold text-blue-600 dark:text-blue-400">₵40</span>. 
              No data limits, no throttling, no restrictions. Stream, download, and browse without limits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/SignUp')}
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Infinity className="w-5 h-5 mr-2" />
                Get Unlimited Data Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/mtnup2u')}
                className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-semibold rounded-xl transition-colors duration-200"
              >
                <Database className="w-5 h-5 mr-2" />
                View All Packages
              </button>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  ∞
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Unlimited Data
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  4G/5G
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Premium Speeds
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  24/7
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Always Available
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  ₵40
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Starting Price
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our <span className="text-blue-600 dark:text-blue-400">Unlimited Data</span> Deals?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience true unlimited data with no restrictions, no throttling, and no hidden limits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unlimited Packages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="text-blue-600 dark:text-blue-400">Unlimited Data</span> Packages
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our range of unlimited data packages for all networks in Ghana.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {unlimitedPackages.map((pkg, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-2 border-blue-200 dark:border-blue-800">
                <div className={`${pkg.color} p-6 text-white text-center`}>
                  <div className="flex justify-center mb-4">
                    {pkg.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-sm opacity-90">{pkg.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {pkg.price}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      {pkg.validity}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => router.push(`/${pkg.name.toLowerCase().replace(' ', '')}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                  >
                    Get {pkg.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Benefits of <span className="text-blue-600 dark:text-blue-400">Unlimited Data</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the freedom of unlimited data with these amazing benefits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say About Our <span className="text-blue-600 dark:text-blue-400">Unlimited Data</span> Deals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied customers enjoying true unlimited data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Experience <span className="text-blue-200">Unlimited Data</span>?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of customers enjoying true unlimited data. 
              No limits, no restrictions, just pure freedom!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/SignUp')}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors duration-200 shadow-lg"
              >
                <Infinity className="w-5 h-5 mr-2" />
                Get Unlimited Data Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/help')}
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-xl transition-colors duration-200"
              >
                <Heart className="w-5 h-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions About <span className="text-blue-600 dark:text-blue-400">Unlimited Data</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "Is the data truly unlimited?",
                answer: "Yes! Our unlimited data packages have no data caps, no throttling, and no restrictions. You can use as much data as you need without any limitations."
              },
              {
                question: "What speeds can I expect with unlimited data?",
                answer: "You'll get 4G/5G speeds with our unlimited data packages. Speeds may vary based on network coverage and congestion, but there's no speed throttling."
              },
              {
                question: "How long does unlimited data last?",
                answer: "Our unlimited data packages are valid for 30 days from the date of activation. You can renew before expiry to maintain continuous service."
              },
              {
                question: "Can I use unlimited data for streaming and gaming?",
                answer: "Absolutely! Our unlimited data is perfect for streaming videos, online gaming, video calls, and any other data-intensive activities."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnlimitedDataDealsPage;
