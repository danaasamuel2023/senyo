'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Smartphone, 
  Zap, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Wifi,
  Signal,
  Globe,
  TrendingDown,
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
  StarIcon
} from 'lucide-react';

// Metadata is handled by layout.js for client components

const CheapDatabundlePage = () => {
  const router = useRouter();

  const features = [
    {
      icon: <TrendingDown className="w-6 h-6" />,
      title: "Cheapest Prices",
      description: "Lowest databundle prices in Ghana. Save up to 50% compared to direct network purchases."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Delivery",
      description: "Get your databundle instantly after payment. No waiting, no delays."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Secure",
      description: "Bank-level security for all transactions. Your data and money are always safe."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support. We're here to help whenever you need us."
    }
  ];

  const networks = [
    {
      name: "MTN",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      icon: <Smartphone className="w-8 h-8" />,
      description: "Ghana's leading network with nationwide coverage",
      packages: ["1GB - ₵5", "2GB - ₵8", "5GB - ₵15", "10GB - ₵25"]
    },
    {
      name: "Vodafone",
      color: "bg-red-500",
      textColor: "text-red-600",
      icon: <Signal className="w-8 h-8" />,
      description: "Reliable network with excellent data speeds",
      packages: ["1GB - ₵5", "2GB - ₵8", "5GB - ₵15", "10GB - ₵25"]
    },
    {
      name: "AirtelTigo",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      icon: <Wifi className="w-8 h-8" />,
      description: "Fast and affordable data packages",
      packages: ["1GB - ₵5", "2GB - ₵8", "5GB - ₵15", "10GB - ₵25"]
    },
    {
      name: "Telecel",
      color: "bg-green-500",
      textColor: "text-green-600",
      icon: <Globe className="w-8 h-8" />,
      description: "Competitive rates with good coverage",
      packages: ["1GB - ₵5", "2GB - ₵8", "5GB - ₵15", "10GB - ₵25"]
    }
  ];

  const testimonials = [
    {
      name: "Kwame Asante",
      location: "Accra",
      rating: 5,
      text: "Best databundle deals in Ghana! I've been saving so much money since I started using this platform."
    },
    {
      name: "Ama Serwaa",
      location: "Kumasi",
      rating: 5,
      text: "Instant delivery and very cheap prices. Highly recommended for anyone looking for affordable data."
    },
    {
      name: "Kofi Mensah",
      location: "Tamale",
      rating: 5,
      text: "Excellent service! The cheapest databundle deals I've found anywhere in Ghana."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Customers" },
    { number: "₵5", label: "Starting Price" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-white dark:from-black dark:via-yellow-900/10 dark:to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-6">
              <Crown className="w-4 h-4 mr-2" />
              #1 Cheapest Databundle Platform in Ghana
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-yellow-600 dark:text-yellow-400">Cheap Databundle</span>
              <br />
              Ghana's Best Deals
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Get unlimited data packages starting from just <span className="font-bold text-yellow-600 dark:text-yellow-400">₵5</span>. 
              The cheapest databundle deals for MTN, Vodafone, AirtelTigo & Telecel. Instant delivery, secure payment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/SignUp')}
                className="inline-flex items-center px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Get Cheap Databundle Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/mtnup2u')}
                className="inline-flex items-center px-8 py-4 border-2 border-yellow-600 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-600 hover:text-white font-semibold rounded-xl transition-colors duration-200"
              >
                <Database className="w-5 h-5 mr-2" />
                View All Packages
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our <span className="text-yellow-600 dark:text-yellow-400">Cheap Databundle</span> Deals?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We offer the most affordable databundle packages in Ghana with unmatched service quality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-6 text-yellow-600 dark:text-yellow-400">
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

      {/* Network Packages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="text-yellow-600 dark:text-yellow-400">Cheap Databundle</span> Packages
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our wide range of affordable databundle packages for all networks in Ghana.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {networks.map((network, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <div className={`${network.color} p-6 text-white text-center`}>
                  <div className="flex justify-center mb-4">
                    {network.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{network.name}</h3>
                  <p className="text-sm opacity-90">{network.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {network.packages.map((pkg, pkgIndex) => (
                      <div key={pkgIndex} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <span className="text-gray-600 dark:text-gray-300">{pkg.split(' - ')[0]}</span>
                        <span className={`font-semibold ${network.textColor}`}>{pkg.split(' - ')[1]}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => router.push(`/${network.name.toLowerCase()}`)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                  >
                    Buy {network.name} Databundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say About Our <span className="text-yellow-600 dark:text-yellow-400">Cheap Databundle</span> Deals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied customers who save money with our affordable databundle packages.
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
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
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
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Get Your <span className="text-yellow-200">Cheap Databundle</span>?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of customers saving money with our affordable databundle deals. 
              Start from just ₵5!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/SignUp')}
                className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors duration-200 shadow-lg"
              >
                <Gift className="w-5 h-5 mr-2" />
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/help')}
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-yellow-600 font-semibold rounded-xl transition-colors duration-200"
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
              Frequently Asked Questions About <span className="text-yellow-600 dark:text-yellow-400">Cheap Databundle</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "What is the cheapest databundle in Ghana?",
                answer: "Our platform offers databundle packages starting from just ₵5 for 1GB across all networks (MTN, Vodafone, AirtelTigo, Telecel). This is significantly cheaper than buying directly from network providers."
              },
              {
                question: "How do I get unlimited data cheap?",
                answer: "We offer unlimited data packages at competitive rates. You can purchase large data bundles (10GB, 20GB, 50GB+) at discounted prices, giving you unlimited-like usage for a fraction of the cost."
              },
              {
                question: "Which network has the best databundle deals?",
                answer: "All networks offer competitive rates on our platform. MTN typically has the widest coverage, Vodafone offers excellent speeds, AirtelTigo provides good value, and Telecel has competitive pricing. Choose based on your location and usage needs."
              },
              {
                question: "How fast is the databundle delivery?",
                answer: "All databundle purchases are delivered instantly after successful payment. You'll receive your data within seconds of completing the transaction."
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

export default CheapDatabundlePage;
