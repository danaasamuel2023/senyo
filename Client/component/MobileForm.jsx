'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle, Info, Loader2 } from 'lucide-react';

// Mobile-optimized Input Component
export const MobileInput = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
  inputMode,
  pattern,
  maxLength,
  helper,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Auto-resize for textarea
  useEffect(() => {
    if (type === 'textarea' && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [value, type]);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        relative rounded-xl overflow-hidden
        ${isFocused ? 'ring-2 ring-[#FFCC08]' : ''}
        ${error ? 'ring-2 ring-red-500' : ''}
        ${success ? 'ring-2 ring-green-500' : ''}
      `}>
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            ref={inputRef}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              resize-none min-h-[100px]
              ${Icon ? 'pl-12' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              focus:outline-none transition-all duration-200
            `}
            {...props}
          />
        ) : (
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 h-12 bg-gray-50 dark:bg-gray-900 
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              ${Icon ? 'pl-12' : ''}
              ${type === 'password' ? 'pr-12' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              focus:outline-none transition-all duration-200
            `}
            {...props}
          />
        )}
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
        
        {(error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error && <X className="w-5 h-5 text-red-500" />}
            {success && <Check className="w-5 h-5 text-green-500" />}
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <div className="mt-2 flex items-start gap-1">
          {error && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
          {helper && !error && <Info className="w-4 h-4 text-gray-400 mt-0.5" />}
          <span className={`text-sm ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {error || helper}
          </span>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized Select Component
export const MobileSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  icon: Icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        relative rounded-xl overflow-hidden
        ${isFocused ? 'ring-2 ring-[#FFCC08]' : ''}
        ${error ? 'ring-2 ring-red-500' : ''}
      `}>
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 h-12 bg-gray-50 dark:bg-gray-900 
            text-gray-900 dark:text-gray-100
            ${Icon ? 'pl-12' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            focus:outline-none transition-all duration-200
            appearance-none
          `}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized Checkbox Component
export const MobileCheckbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  error,
}) => {
  return (
    <label className={`
      flex items-start gap-3 p-3 rounded-xl cursor-pointer
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-50 dark:active:bg-gray-900'}
      ${error ? 'ring-2 ring-red-500' : ''}
    `}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 w-5 h-5 text-[#FFCC08] rounded focus:ring-[#FFCC08] focus:ring-2"
      />
      <div className="flex-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        {error && (
          <span className="block text-sm text-red-500 mt-1">{error}</span>
        )}
      </div>
    </label>
  );
};

// Mobile-optimized Radio Group Component
export const MobileRadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`space-y-2 ${error ? 'ring-2 ring-red-500 rounded-xl p-1' : ''}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-3 p-3 rounded-xl cursor-pointer
              ${value === option.value ? 'bg-[#FFCC08]/10 ring-2 ring-[#FFCC08]' : 'bg-gray-50 dark:bg-gray-900'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'}
              transition-all duration-200
            `}
          >
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled || option.disabled}
              className="w-5 h-5 text-[#FFCC08] focus:ring-[#FFCC08] focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </div>
              )}
            </div>
            {option.price && (
              <div className="text-lg font-bold text-[#FFCC08]">
                ₵{option.price}
              </div>
            )}
          </label>
        ))}
      </div>
      
      {error && (
        <div className="mt-2 flex items-start gap-1">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized Toggle Switch Component
export const MobileToggle = ({
  label,
  checked,
  onChange,
  disabled = false,
  size = 'medium',
}) => {
  const sizes = {
    small: { switch: 'w-10 h-6', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    medium: { switch: 'w-12 h-7', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    large: { switch: 'w-14 h-8', thumb: 'w-6 h-6', translate: 'translate-x-6' },
  };

  const sizeConfig = sizes[size];

  return (
    <label className={`
      flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-50 dark:active:bg-gray-900'}
    `}>
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative ${sizeConfig.switch} rounded-full transition-colors duration-200
          ${checked ? 'bg-[#FFCC08]' : 'bg-gray-300 dark:bg-gray-700'}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 ${sizeConfig.thumb} rounded-full bg-white
            transition-transform duration-200 transform
            ${checked ? sizeConfig.translate : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
};

// Mobile-optimized Button Component
export const MobileButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  onClick,
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-[#FFCC08] to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700',
    secondary: 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900',
  };

  const sizes = {
    small: 'px-3 py-2 text-sm min-h-[40px]',
    medium: 'px-4 py-3 text-base min-h-[48px]',
    large: 'px-6 py-4 text-lg min-h-[56px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-98 active:shadow-inner
        flex items-center justify-center gap-2
      `}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!loading && Icon && <Icon className="w-5 h-5" />}
      {children}
      {!loading && IconRight && <IconRight className="w-5 h-5" />}
    </button>
  );
};

// Mobile Form Container
export const MobileForm = ({ children, onSubmit, className = '' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      noValidate
    >
      {children}
    </form>
  );
};

export default MobileForm;