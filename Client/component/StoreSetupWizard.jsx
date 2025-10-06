'use client';

import React, { useState } from 'react';
import {
  Store, Palette, Upload, Eye, CheckCircle, ArrowRight, ArrowLeft,
  X, Globe, MessageCircle, Facebook, Twitter, Instagram, Clock,
  MapPin, Type, Image as ImageIcon, Save, Sparkles
} from 'lucide-react';

const StoreSetupWizard = ({ isOpen, onClose, onComplete, agentData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [storeData, setStoreData] = useState({
    storeName: `${agentData?.name || 'Agent'}'s Data Store`,
    welcomeMessage: 'Welcome to my data store! Get the best data bundles at competitive prices.',
    storeDescription: 'Your trusted partner for affordable data bundles in Ghana.',
    brandColor: '#EAB308',
    logo: null,
    socialLinks: {
      whatsapp: agentData?.phoneNumber || '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    businessHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '17:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    }
  });

  const steps = [
    { id: 1, title: 'Store Name', icon: Type },
    { id: 2, title: 'Branding', icon: Palette },
    { id: 3, title: 'Contact', icon: MessageCircle },
    { id: 4, title: 'Hours', icon: Clock },
    { id: 5, title: 'Preview', icon: Eye }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(storeData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Type className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Name Your Store</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose a memorable name for your data store</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={storeData.storeName}
                  onChange={(e) => setStoreData({...storeData, storeName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter your store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={storeData.welcomeMessage}
                  onChange={(e) => setStoreData({...storeData, welcomeMessage: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Welcome message for your customers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Store Description
                </label>
                <textarea
                  value={storeData.storeDescription}
                  onChange={(e) => setStoreData({...storeData, storeDescription: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Brief description of your store"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Brand Your Store</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose colors and upload a logo to make your store unique</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Brand Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={storeData.brandColor}
                    onChange={(e) => setStoreData({...storeData, brandColor: e.target.value})}
                    className="w-16 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={storeData.brandColor}
                      onChange={(e) => setStoreData({...storeData, brandColor: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white font-mono"
                      placeholder="#EAB308"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Store Logo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-yellow-500 transition-colors">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Upload your store logo</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 2MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setStoreData({...storeData, logo: file});
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Color Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h4>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: storeData.brandColor }}
                  >
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">{storeData.storeName}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your store preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Information</h3>
              <p className="text-gray-600 dark:text-gray-400">Add your contact details and social media links</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <input
                  type="text"
                  value={storeData.socialLinks.whatsapp}
                  onChange={(e) => setStoreData({
                    ...storeData, 
                    socialLinks: {...storeData.socialLinks, whatsapp: e.target.value}
                  })}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="WhatsApp number (e.g., +233123456789)"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Facebook className="w-5 h-5 text-blue-600" />
                <input
                  type="text"
                  value={storeData.socialLinks.facebook}
                  onChange={(e) => setStoreData({
                    ...storeData, 
                    socialLinks: {...storeData.socialLinks, facebook: e.target.value}
                  })}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Facebook page URL"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Twitter className="w-5 h-5 text-sky-500" />
                <input
                  type="text"
                  value={storeData.socialLinks.twitter}
                  onChange={(e) => setStoreData({
                    ...storeData, 
                    socialLinks: {...storeData.socialLinks, twitter: e.target.value}
                  })}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Twitter profile URL"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-pink-500" />
                <input
                  type="text"
                  value={storeData.socialLinks.instagram}
                  onChange={(e) => setStoreData({
                    ...storeData, 
                    socialLinks: {...storeData.socialLinks, instagram: e.target.value}
                  })}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Instagram profile URL"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Hours</h3>
              <p className="text-gray-600 dark:text-gray-400">Set your store operating hours</p>
            </div>

            <div className="space-y-4">
              {Object.entries(storeData.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) => setStoreData({
                        ...storeData,
                        businessHours: {
                          ...storeData.businessHours,
                          [day]: {...hours, isOpen: e.target.checked}
                        }
                      })}
                      className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {day}
                    </span>
                  </div>
                  
                  {hours.isOpen && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => setStoreData({
                          ...storeData,
                          businessHours: {
                            ...storeData.businessHours,
                            [day]: {...hours, open: e.target.value}
                          }
                        })}
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => setStoreData({
                          ...storeData,
                          businessHours: {
                            ...storeData.businessHours,
                            [day]: {...hours, close: e.target.value}
                          }
                        })}
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preview Your Store</h3>
              <p className="text-gray-600 dark:text-gray-400">Review your store settings before going live</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: storeData.brandColor }}
                >
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {storeData.storeName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {storeData.welcomeMessage}
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{agentData?.agentMetadata?.territory || 'Ghana'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{storeData.businessHours.monday.open} - {storeData.businessHours.monday.close}</span>
                  </div>
                </div>
              </div>

              {/* Store URL */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Your Store URL</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {typeof window !== 'undefined' ? `${window.location.origin}/agent-store/${agentData?.agentCode}` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(storeData.socialLinks?.whatsapp || storeData.socialLinks?.facebook || storeData.socialLinks?.twitter || storeData.socialLinks?.instagram) && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact & Social</h4>
                  <div className="flex flex-wrap gap-3">
                    {storeData.socialLinks?.whatsapp && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">WhatsApp</span>
                      </div>
                    )}
                    {storeData.socialLinks?.facebook && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Facebook</span>
                      </div>
                    )}
                    {storeData.socialLinks?.twitter && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                        <Twitter className="w-4 h-4 text-sky-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Twitter</span>
                      </div>
                    )}
                    {storeData.socialLinks?.instagram && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Instagram</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Your Store</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-yellow-600 text-black' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black rounded-xl font-semibold transition-all"
            >
              <span>{currentStep === 5 ? 'Create Store' : 'Next'}</span>
              {currentStep === 5 ? (
                <Save className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSetupWizard;
