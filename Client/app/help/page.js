'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle, Search, MessageCircle, Mail, Phone, Book, 
  ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Zap,
  Shield, CreditCard, Package, Users, Settings, CheckCircle,
  AlertCircle, Info, FileText
} from 'lucide-react';

const HelpPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      icon: Zap,
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Sign Up" in the top right corner, fill in your details including name, email, phone number, and password. You\'ll receive a verification email to confirm your account.'
        },
        {
          q: 'How do I top up my wallet?',
          a: 'Navigate to "Top Up Wallet" in the sidebar, select your payment method (Paystack or Moorle), enter the amount, and follow the payment instructions.'
        },
        {
          q: 'What networks do you support?',
          a: 'We support MTN (YELLO), Vodafone, AirtelTigo, AirtelTigo Premium, and Telecel networks across Ghana.'
        }
      ]
    },
    {
      id: 2,
      category: 'Purchasing Data',
      icon: Package,
      questions: [
        {
          q: 'How do I purchase data?',
          a: 'Go to your preferred network page (MTN, Vodafone, etc.), select the data bundle, enter the recipient phone number, and click purchase. The amount will be deducted from your wallet.'
        },
        {
          q: 'How long does it take to receive data?',
          a: 'Most data purchases are instant. You should receive the data within 1-5 minutes. If delayed, check your transaction history or contact support.'
        },
        {
          q: 'Can I purchase data for any number?',
          a: 'Yes, you can purchase data for any valid Ghana phone number on supported networks. Ensure the phone number matches the network you\'re purchasing for.'
        }
      ]
    },
    {
      id: 3,
      category: 'Agent Program',
      icon: Users,
      questions: [
        {
          q: 'How do I become an agent?',
          a: 'Visit the Agent Signup page, complete the 3-step registration process including personal info, territory, and bank details. An admin will review and approve your application.'
        },
        {
          q: 'How do agent commissions work?',
          a: 'Agents earn 5-10% commission on all sales made through their custom store. Commissions are calculated automatically and paid monthly to your registered bank account.'
        },
        {
          q: 'Can I customize my agent store?',
          a: 'Yes! Once approved, you can customize your store with a custom URL, brand colors, logo, banner, welcome message, and social media links.'
        }
      ]
    },
    {
      id: 4,
      category: 'Payments & Wallet',
      icon: CreditCard,
      questions: [
        {
          q: 'What payment methods are accepted?',
          a: 'We accept Mobile Money payments through Paystack and Moorle. You can pay with MTN MoMo, Vodafone Cash, and AirtelTigo Money.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, all payments are processed through secure, PCI-compliant payment gateways (Paystack and Moorle). We never store your card or mobile money details.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Refunds are automatically processed for failed orders. The amount is credited back to your wallet immediately. For other refund requests, contact support.'
        }
      ]
    },
    {
      id: 5,
      category: 'Account & Settings',
      icon: Settings,
      questions: [
        {
          q: 'How do I change my password?',
          a: 'Go to Settings page, click on "Security" tab, enter your current password and new password, then click "Update Password".'
        },
        {
          q: 'Can I update my phone number?',
          a: 'Yes, go to Settings → Account tab, update your phone number, and verify it with the OTP sent to the new number.'
        },
        {
          q: 'How do I enable two-factor authentication?',
          a: 'Navigate to Settings → Security → Two-Factor Authentication, click "Enable", and follow the setup instructions.'
        }
      ]
    },
    {
      id: 6,
      category: 'Troubleshooting',
      icon: AlertCircle,
      questions: [
        {
          q: 'My data purchase failed, what should I do?',
          a: 'Check your transaction history. If the payment was deducted, it will be automatically refunded to your wallet. If the issue persists, contact support with your transaction reference.'
        },
        {
          q: 'I didn\'t receive my data bundle',
          a: 'First, check your phone to confirm. Data delivery can take 1-5 minutes. Check your transaction status in "My Orders". If still not received after 10 minutes, contact support.'
        },
        {
          q: 'My wallet balance is incorrect',
          a: 'Refresh your page. If the issue persists, check your transaction history for all debits and credits. Contact support if you find discrepancies.'
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      value: '+233 25 670 2995',
      action: 'tel:+233256702995',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Group',
      value: 'Join our community',
      action: 'https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'Unlimiteddatagh@gmail.com',
      action: 'mailto:Unlimiteddatagh@gmail.com',
      color: 'from-blue-500 to-blue-600'
    }
  ];

  const toggleFAQ = (categoryId, questionIndex) => {
    const faqId = `${categoryId}-${questionIndex}`;
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const filteredFAQs = searchTerm
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
               q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/')}
            className="p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFCC08] to-yellow-600 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Find answers to your questions</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC08] text-lg"
          />
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <a
                key={method.title}
                href={method.action}
                target={method.action.startsWith('http') ? '_blank' : undefined}
                rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`bg-gradient-to-r ${method.color} rounded-2xl p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <div className="text-lg font-bold mb-1">{method.title}</div>
                <div className="text-sm opacity-90">{method.value}</div>
              </a>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {filteredFAQs.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-[#FFCC08] rounded-xl">
                    <CategoryIcon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.category}</h3>
                </div>

                <div className="space-y-3">
                  {category.questions.map((faq, index) => {
                    const faqId = `${category.id}-${index}`;
                    const isExpanded = expandedFAQ === faqId;

                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleFAQ(category.id, index)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <span className="font-medium text-gray-900 dark:text-white pr-4">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                            <p className="leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {searchTerm && filteredFAQs.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try different keywords or contact support
            </p>
          </div>
        )}

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <Book className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Documentation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Detailed guides and tutorials for all features
            </p>
            <button className="text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-2 hover:underline">
              <span>View Docs</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <FileText className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">API Documentation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              For developers integrating with our platform
            </p>
            <button 
              onClick={() => router.push('/api-doc')}
              className="text-purple-600 dark:text-purple-400 font-medium flex items-center space-x-2 hover:underline"
            >
              <span>API Reference</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-2xl p-8 text-black text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="mb-6 opacity-80">
            Our support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a
              href="https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-black text-[#FFCC08] rounded-xl hover:bg-gray-900 transition-all font-bold flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Join WhatsApp Group</span>
            </a>
            <a
              href="mailto:Unlimiteddatagh@gmail.com"
              className="px-6 py-3 bg-white/20 backdrop-blur text-black rounded-xl hover:bg-white/30 transition-all font-bold flex items-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
