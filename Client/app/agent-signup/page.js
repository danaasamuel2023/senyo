'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Mail, Lock, Phone, User, MapPin, Building, CreditCard,
  ArrowRight, Loader2, CheckCircle, AlertTriangle, X, Eye, EyeOff,
  Briefcase, FileText, Shield, Star, TrendingUp, DollarSign, UserPlus
} from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-3 rounded-xl shadow-xl flex items-center backdrop-blur-xl border max-w-sm ${
        type === 'success' 
          ? 'bg-green-500/95 text-white border-green-400/50' 
          : 'bg-red-600/95 text-white border-red-500/50'
      }`}>
        <div className="mr-2">
          {type === 'success' ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>
        <div className="flex-grow">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 hover:scale-110 transition-transform">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function AgentSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Form data
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    
    // Agent Info
    territory: '',
    idType: '',
    idNumber: '',
    
    // Bank Details
    bankName: '',
    accountName: '',
    accountNumber: '',
    momoNumber: ''
  });

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
          setError('Please fill all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        break;
      
      case 2:
        if (!formData.territory || !formData.idType || !formData.idNumber) {
          setError('Please fill all required fields');
          return false;
        }
        break;
      
      case 3:
        if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
          setError('Please provide bank account details');
          return false;
        }
        if (!agreedToTerms) {
          setError('You must agree to the terms and conditions');
          return false;
        }
        break;
    }
    
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      const API_URL = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001/api/v1/register'
        : 'https://unlimitedata.onrender.com/api/v1/register';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          role: 'agent', // Set role as agent
          agentMetadata: {
            territory: formData.territory,
            documents: {
              idType: formData.idType,
              idNumber: formData.idNumber
            },
            bankDetails: {
              bankName: formData.bankName,
              accountName: formData.accountName,
              accountNumber: formData.accountNumber,
              momoNumber: formData.momoNumber
            },
            agentStatus: 'pending' // Will be approved by admin
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Agent registration successful! Please wait for admin approval.', 'success');
        setTimeout(() => {
          router.push('/SignIn');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+233501234567"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  className="pl-10 pr-10 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/60 hover:text-[#FFCC08] transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60 hover:text-[#FFCC08] transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-white/60 hover:text-[#FFCC08] transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60 hover:text-[#FFCC08] transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agent Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Territory/Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="text"
                  name="territory"
                  value={formData.territory}
                  onChange={handleInputChange}
                  placeholder="e.g., Accra, Kumasi, Tema"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Type *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm appearance-none"
                  required
                >
                  <option value="">Select ID Type</option>
                  <option value="ghana_card">Ghana Card</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voter_id">Voter ID</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your ID number"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Details & Agreement</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g., GCB Bank, Ecobank"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  placeholder="Account holder name"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Bank account number"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile Money Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="tel"
                  name="momoNumber"
                  value={formData.momoNumber}
                  onChange={handleInputChange}
                  placeholder="+233501234567"
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm"
                />
              </div>
            </div>

            {/* Terms & Agreement */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Agent Agreement</h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  By registering as an agent, you agree to promote UnlimitedData GH products, maintain professional conduct, 
                  protect customer data, and comply with all policies. Commission: 5% base rate with performance bonuses up to 10%. 
                  Payment monthly to registered account.
                </p>
              </div>
              
              <label className="flex items-start space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#FFCC08] focus:ring-[#FFCC08] border-[#FFCC08]/30 rounded bg-white/10 backdrop-blur-sm"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and agree to the Agent Terms & Conditions and Commission Structure
                </span>
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-[#FFD700]/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-black/40 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="relative z-10 w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-[#FFCC08]/30 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-[#FFCC08] p-6 relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center shadow-xl">
                  <Users className="w-8 h-8 text-[#FFCC08]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-black">Become an Agent</h1>
              <p className="text-black/80 text-sm mt-1">Join our network of successful agents</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    i <= step ? 'bg-[#FFCC08] text-black' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`w-16 h-0.5 ${
                      i < step ? 'bg-[#FFCC08]' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 rounded-xl flex items-start bg-red-600/20 border border-red-600/40 backdrop-blur-sm">
                <div className="w-5 h-5 rounded-lg bg-red-600/30 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-300" />
                </div>
                <span className="text-red-200 font-medium text-sm">{error}</span>
              </div>
            )}

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-white hover:text-[#FFCC08] transition-colors font-medium"
                >
                  Back
                </button>
              )}
              
              <div className={step === 1 ? 'w-full' : 'ml-auto'}>
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-xl text-black bg-[#FFCC08] hover:bg-[#FFCC08]/90 focus:outline-none focus:ring-4 focus:ring-[#FFCC08]/50 transition-all duration-300 transform hover:scale-105 font-bold"
                  >
                    Next
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !agreedToTerms}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-xl text-black bg-[#FFCC08] hover:bg-[#FFCC08]/90 focus:outline-none focus:ring-4 focus:ring-[#FFCC08]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-bold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 w-4 h-4" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 w-4 h-4" />
                        Complete Registration
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="text-center mt-6">
              <p className="text-white/60 text-sm">
                Already have an account?{' '}
                <a href="/SignIn" className="text-[#FFCC08] hover:text-[#FFD700] font-medium hover:underline">
                  Sign In
                </a>
              </p>
              <p className="text-white/60 text-sm mt-2">
                Not an agent?{' '}
                <a href="/SignUp" className="text-[#FFCC08] hover:text-[#FFD700] font-medium hover:underline">
                  Regular Sign Up
                </a>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-[#FFCC08]/20 border border-[#FFCC08]/40 rounded-xl backdrop-blur-sm">
              <h4 className="text-sm font-bold text-[#FFCC08] mb-2">Agent Benefits</h4>
              <div className="space-y-1 text-white/80 text-xs">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-[#FFCC08] mr-2" />
                  <span>Earn competitive commissions</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 text-[#FFCC08] mr-2" />
                  <span>Performance-based incentives</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-3 h-3 text-[#FFCC08] mr-2" />
                  <span>Full training and support</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 text-[#FFCC08] mr-2" />
                  <span>Monthly payment guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
