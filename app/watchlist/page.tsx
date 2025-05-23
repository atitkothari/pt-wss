'use client';

import { PageLayout } from "../components/PageLayout";
import { Star, Bell, Search, Filter } from "lucide-react";

export default function WatchlistPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Watchlist</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're working on an exciting new feature to help you track and monitor your favorite stocks and options.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Track Your Favorites</h3>
            </div>
            <p className="text-gray-600">
              Save stocks and options you're interested in and get updates on their performance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Custom Alerts</h3>
            </div>
            <p className="text-gray-600">
              Set up personalized alerts for price movements, option opportunities, and important events.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Filters</h3>
            </div>
            <p className="text-gray-600">
              Organize your watchlist with custom filters and categories to find opportunities faster.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Priority Tracking</h3>
            </div>
            <p className="text-gray-600">
              Mark your most important stocks and get notifications when opportunities arise.
            </p>
          </div>
        </div>

        {/* Sample Watchlist Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-12">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sample Watchlist</h2>
            <p className="text-sm text-gray-600 mt-1">Preview of how your watchlist will look</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strike</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AAPL</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Call</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$180.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-04-19</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$2.45</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">MSFT</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Put</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$400.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-04-19</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$3.20</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">NVDA</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Call</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$850.00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-04-19</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$15.75</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Want to be the first to know when the watchlist feature launches?
          </p>
          <button
            onClick={() => window.location.href = 'mailto:reply@wheelstrategyoptions.com'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Contact Us
          </button>
        </div>
      </div>
    </PageLayout>
  );
} 