'use client';

import { Package, ShoppingBag, CreditCard, Users, FileText, Search, AlertCircle, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const EmptyOrders = () => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-[#FFCC08]/10 to-yellow-500/10 rounded-full flex items-center justify-center">
          <Package className="w-12 h-12 text-[#FFCC08]" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#FFCC08] to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-black text-xs font-bold">0</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Orders Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        Start your data business by placing your first order. It's quick, easy, and instant!
      </p>
      <button 
        onClick={() => router.push('/mtnup2u')}
        className="px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center space-x-2"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Place First Order</span>
      </button>
    </div>
  );
};

export const EmptyTransactions = () => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full flex items-center justify-center">
          <CreditCard className="w-12 h-12 text-green-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Transactions Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        Top up your wallet to start making purchases and track your transaction history here.
      </p>
      <button 
        onClick={() => router.push('/topup')}
        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center space-x-2"
      >
        <CreditCard className="w-5 h-5" />
        <span>Top Up Wallet</span>
      </button>
    </div>
  );
};

export const EmptyUsers = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
          <Users className="w-12 h-12 text-blue-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Users Found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
        No users match your search criteria. Try adjusting your filters.
      </p>
    </div>
  );
};

export const EmptyReports = () => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-purple-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Reports Available
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        Reports will appear here once you have transaction data to analyze.
      </p>
    </div>
  );
};

export const EmptySearch = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-gray-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Results Found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
        {searchTerm 
          ? `No results for "${searchTerm}". Try different keywords.`
          : 'Try searching with different terms.'
        }
      </p>
    </div>
  );
};

export const EmptyError = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Oops! Something Went Wrong
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        {message || 'We encountered an error loading this content. Please try again.'}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export const EmptyGeneric = ({ icon: Icon = Inbox, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-full flex items-center justify-center">
          <Icon className="w-12 h-12 text-gray-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title || 'No Data'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        {description || 'There is no data to display at the moment.'}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-[#FFCC08] to-yellow-500 text-black rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyOrders;

