'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Smartphone, 
  Signal, 
  Wifi, 
  Globe, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Star,
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
  Battery,
  WifiOff,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

// Metadata is handled by layout.js for client components

const DatabundleComparisonPage = () => {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState('1GB');

  const networks = [
    {
      name: "MTN",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      icon: <Smartphone className="w-8 h-8" />,
      description: "Ghana's leading network",
      coverage: "98%",
      speed: "4.5/5",
      packages: {
        "1GB": { price: 5, validity: "7 days", features: ["Fast 4G", "Nationwide coverage"] },
        "2GB": { price: 8, validity: "14 days", features: ["Fast 4G", "Nationwide coverage", "Priority support"] },
        "5GB": { price: 15, validity: "30 days", features: ["Fast 4G", "Nationwide coverage", "Priority support", "Data rollover"] },
        "10GB": { price: 25, validity: "30 days", features: ["Fast 4G", "Nationwide coverage", "Priority support", "Data rollover", "Free streaming"] }
      },
      pros: ["Best coverage", "Fast speeds", "Reliable network", "Good customer service"],
      cons: ["Higher prices", "Network congestion"],
      rating: 4.5
    },
    {
      name: "Vodafone",
      color: "bg-red-500",
      textColor: "text-red-600",
      icon: <Signal className="w-8 h-8" />,
      description: "Fast and reliable network",
      coverage: "95%",
      speed: "4.3/5",
      packages: {
        "1GB": { price: 5, validity: "7 days", features: ["Fast 4G", "Good coverage"] },
        "2GB": { price: 8, validity: "14 days", features: ["Fast 4G", "Good coverage", "Customer support"] },
        "5GB": { price: 15, validity: "30 days", features: ["Fast 4G", "Good coverage", "Customer support", "Data rollover"] },
        "10GB": { price: 25, validity: "30 days", features: ["Fast 4G", "Good coverage", "Customer support", "Data rollover", "Free apps"] }
      },
      pros: ["Fast speeds", "Good coverage", "Competitive prices", "Reliable service"],
      cons: ["Limited rural coverage", "Customer service issues"],
      rating: 4.3
    },
    {
      name: "AirtelTigo",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      icon: <Wifi className="w-8 h-8" />,
      description: "Affordable and fast",
      coverage: "90%",
      speed: "4.0/5",
      packages: {
        "1GB": { price: 5, validity: "7 days", features: ["4G speeds", "Good coverage"] },
        "2GB": { price: 8, validity: "14 days", features: ["4G speeds", "Good coverage", "Support"] },
        "5GB": { price: 15, validity: "30 days", features: ["4G speeds", "Good coverage", "Support", "Data rollover"] },
        "10GB": { price: 25, validity: "30 days", features: ["4G speeds", "Good coverage", "Support", "Data rollover", "Free content"] }
      },
      pros: ["Affordable prices", "Good value", "Fast speeds", "Growing coverage"],
      cons: ["Limited coverage", "Network issues"],
      rating: 4.0
    },
    {
      name: "Telecel",
      color: "bg-green-500",
      textColor: "text-green-600",
      icon: <Globe className="w-8 h-8" />,
      description: "Competitive rates",
      coverage: "85%",
      speed: "3.8/5",
      packages: {
        "1GB": { price: 5, validity: "7 days", features: ["4G speeds", "Basic coverage"] },
        "2GB": { price: 8, validity: "14 days", features: ["4G speeds", "Basic coverage", "Support"] },
        "5GB": { price: 15, validity: "30 days", features: ["4G speeds", "Basic coverage", "Support", "Data rollover"] },
        "10GB": { price: 25, validity: "30 days", features: ["4G speeds", "Basic coverage", "Support", "Data rollover", "Free services"] }
      },
      pros: ["Competitive prices", "Good deals", "Reliable service", "Customer focus"],
      cons: ["Limited coverage", "Slower speeds", "Network reliability"],
      rating: 3.8
    }
  ];

  const comparisonFeatures = [
    { feature: "Network Coverage", mtn: "98%", vodafone: "95%", airteltigo: "90%", telecel: "85%" },
    { feature: "Average Speed", mtn: "4.5/5", vodafone: "4.3/5", airteltigo: "4.0/5", telecel: "3.8/5" },
    { feature: "Customer Service", mtn: "Excellent", vodafone: "Good", airteltigo: "Good", telecel: "Fair" },
    { feature: "Data Rollover", mtn: "Yes", vodafone: "Yes", airteltigo: "Yes", telecel: "Yes" },
    { feature: "Free Streaming", mtn: "Yes", vodafone: "Yes", airteltigo: "Limited", telecel: "No" },
    { feature: "Price Range", mtn: "₵5-₵25", vodafone: "₵5-₵25", airteltigo: "₵5-₵25", telecel: "₵5-₵25" }
  ];

  const getBestDeal = () => {
    const packageData = networks.map(network => ({
      name: network.name,
      price: network.packages[selectedPackage].price,
      rating: network.rating
    }));
    
    return packageData.sort((a, b) => a.price - b.price)[0];
  };

  const bestDeal = getBestDeal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white dark:from-black dark:via-green-900/10 dark:to-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4 mr-2" />
              #1 Databundle Comparison Platform in Ghana
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-green-600 dark:text-green-400">Databundle</span>
              <br />
              Comparison Ghana
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Compare databundle packages from all networks in Ghana. Find the <span className="font-bold text-green-600 dark:text-green-400">best deals</span> 
              for MTN, Vodafone, AirtelTigo & Telecel. Make informed decisions with our comprehensive comparison.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/SignUp')}
                className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Get Best Databundle Deal
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/cheap-databundle')}
                className="inline-flex items-center px-8 py-4 border-2 border-green-600 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white font-semibold rounded-xl transition-colors duration-200"
              >
                <Database className="w-5 h-5 mr-2" />
                View Cheap Deals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Package Selector */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Select Package Size to Compare
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['1GB', '2GB', '5GB', '10GB'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedPackage(size)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ${
                    selectedPackage === size
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-green-200 dark:border-green-800 hover:border-green-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Network Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="text-green-600 dark:text-green-400">Databundle</span> Comparison
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Compare {selectedPackage} packages from all networks in Ghana.
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
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      ₵{network.packages[selectedPackage].price}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mb-4">
                      {network.packages[selectedPackage].validity}
                    </div>
                    <div className="flex items-center justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(network.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        {network.rating}/5
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {network.packages[selectedPackage].features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => router.push(`/${network.name.toLowerCase()}`)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                  >
                    Get {network.name} {selectedPackage}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Deal Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Crown className="w-4 h-4 mr-2" />
              Best Deal Alert
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Best {selectedPackage} Deal: <span className="text-green-200">{bestDeal.name}</span>
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get {selectedPackage} for just <span className="font-bold text-green-200">₵{bestDeal.price}</span> with {bestDeal.name}. 
              Rated {bestDeal.rating}/5 stars by our customers.
            </p>
            <button
              onClick={() => router.push(`/${bestDeal.name.toLowerCase()}`)}
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors duration-200 shadow-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Get Best Deal Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Detailed <span className="text-green-600 dark:text-green-400">Feature Comparison</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Compare all features and benefits across networks.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 dark:bg-green-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      MTN
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-red-600 dark:text-red-400">
                      Vodafone
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      AirtelTigo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                      Telecel
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {feature.feature}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                        {feature.mtn}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                        {feature.vodafone}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                        {feature.airteltigo}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                        {feature.telecel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Pros and Cons */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Network <span className="text-green-600 dark:text-green-400">Pros & Cons</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Detailed analysis of each network's strengths and weaknesses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {networks.map((network, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className={`${network.color} p-4 rounded-xl text-white text-center mb-6`}>
                  <div className="flex justify-center mb-2">
                    {network.icon}
                  </div>
                  <h3 className="text-xl font-bold">{network.name}</h3>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Pros
                  </h4>
                  <ul className="space-y-2">
                    {network.pros.map((pro, proIndex) => (
                      <li key={proIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    Cons
                  </h4>
                  <ul className="space-y-2">
                    {network.cons.map((con, conIndex) => (
                      <li key={conIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Get Your <span className="text-green-200">Best Databundle Deal</span>?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Based on our comparison, choose the network that best fits your needs. 
              All packages start from just ₵5!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/SignUp')}
                className="inline-flex items-center px-8 py-4 bg-white text-green-600 hover:bg-gray-100 font-semibold rounded-xl transition-colors duration-200 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={() => router.push('/help')}
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold rounded-xl transition-colors duration-200"
              >
                <Heart className="w-5 h-5 mr-2" />
                Need Help Choosing?
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DatabundleComparisonPage;
