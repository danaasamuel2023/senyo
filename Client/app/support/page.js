'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle, Mail, Phone, Send, ArrowLeft, CheckCircle,
  AlertCircle, X, HelpCircle, Clock, User, Zap, Shield,
  FileText, Headphones, Globe, Star, Award
} from 'lucide-react';

const SupportPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      // Simulate sending - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Your message has been sent! We\'ll respond within 24 hours.', 'success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Join our community group',
      action: 'Join Group',
      link: 'https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP',
      color: 'from-green-500 to-green-600',
      response: 'Instant'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team',
      action: '+233 25 670 2995',
      link: 'tel:+233256702995',
      color: 'from-blue-500 to-blue-600',
      response: '24/7'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Send us a message',
      action: 'Unlimiteddatagh@gmail.com',
      link: 'mailto:Unlimiteddatagh@gmail.com',
      color: 'from-purple-500 to-purple-600',
      response: '< 24 hours'
    }
  ];

  const quickLinks = [
    { icon: HelpCircle, text: 'FAQs', link: '/help' },
    { icon: FileText, text: 'Documentation', link: '/help' },
    { icon: Shield, text: 'Security', link: '/help' },
    { icon: Globe, text: 'Status Page', link: '/' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center space-x-3 animate-slide-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFCC08] via-yellow-400 to-yellow-500 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="mb-6 p-2 bg-black/20 hover:bg-black/30 rounded-xl transition-all inline-flex items-center space-x-2 text-black"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                <Headphones className="w-10 h-10 text-[#FFCC08]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              We're Here to Help
            </h1>
            <p className="text-lg text-black/80 max-w-2xl mx-auto">
              Get in touch with our support team. We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.title}
                href={channel.link}
                target={channel.link.startsWith('http') ? '_blank' : undefined}
                rel={channel.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`bg-gradient-to-br ${channel.color} rounded-2xl p-6 text-white hover:shadow-2xl transition-all transform hover:-translate-y-1`}
              >
                <Icon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold mb-2">{channel.title}</h3>
                <p className="text-white/80 text-sm mb-4">{channel.description}</p>
                <div className="text-lg font-semibold mb-2">{channel.action}</div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Response: {channel.response}</span>
                </div>
              </a>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFCC08]"
                  placeholder="Describe your issue or question..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-[#FFCC08] to-yellow-500 hover:from-yellow-500 hover:to-[#FFCC08] text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Help & Resources */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.text}
                      onClick={() => router.push(link.link)}
                      className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-center"
                    >
                      <Icon className="w-8 h-8 text-[#FFCC08] mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{link.text}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                <p>Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 4:00 PM</p>
                <p className="text-green-600 dark:text-green-400 font-medium mt-2">
                  ⚡ Emergency support available 24/7
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-8 h-8 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Why Choose Us</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.8/5 Customer Rating</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Fast Response Time</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-yellow-500" />
                  <span>Secure & Reliable</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-yellow-500" />
                  <span>100% Satisfaction Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Popular Topics</h3>
              <div className="space-y-2">
                {[
                  'How to purchase data',
                  'Wallet top-up issues',
                  'Transaction failed',
                  'Become an agent',
                  'Refund policy'
                ].map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => router.push('/help')}
                    className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-sm text-gray-700 dark:text-gray-300"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-2xl p-8 text-center text-black">
          <Zap className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Need Immediate Help?</h2>
          <p className="mb-6 opacity-80">
            For urgent issues, reach out via WhatsApp for instant support
          </p>
          <a
            href="https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-black text-[#FFCC08] rounded-xl hover:bg-gray-900 transition-all font-bold shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Join WhatsApp Group</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
