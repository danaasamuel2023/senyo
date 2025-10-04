'use client';

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
    <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="w-28 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse">
    <div className="w-40 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
    <div className="h-64 flex items-end justify-between space-x-2">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i} 
          className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg"
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Banner Skeleton */}
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 animate-pulse h-48" />
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    
    {/* Chart Skeleton */}
    <SkeletonChart />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-2/3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonCard;

