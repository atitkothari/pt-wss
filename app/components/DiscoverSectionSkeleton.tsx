"use client";

export function DiscoverSectionSkeleton() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="space-y-3 sm:space-y-4">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Covered Call Section Skeleton */}
          <div className="space-y-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>

            {/* Category Tabs Skeleton */}
            <div className="mb-6">
              <div className="flex space-x-1 border-b border-gray-200">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="relative px-4 py-2">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock List Skeleton */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-1.5 sm:p-2 font-medium text-sm border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  <div className="w-8"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-center p-1.5 sm:p-2 text-sm">
                      <div className="flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-6 animate-pulse mr-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Find More button skeleton */}
                <div className="mt-3 text-center">
                  <div className="h-8 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Secured Put Section Skeleton */}
          <div className="space-y-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>

            {/* Category Tabs Skeleton */}
            <div className="mb-6">
              <div className="flex space-x-1 border-b border-gray-200">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="relative px-4 py-2">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock List Skeleton */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center p-1.5 sm:p-2 font-medium text-sm border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  <div className="w-8"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-center p-1.5 sm:p-2 text-sm">
                      <div className="flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-6 animate-pulse mr-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Find More button skeleton */}
                <div className="mt-3 text-center">
                  <div className="h-8 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
