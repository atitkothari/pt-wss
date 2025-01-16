import { OptionTabs } from "../components/OptionTabs";

export default function OptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-b from-gray-900 to-gray-800 w-full border-b border-gray-700 p-4">
        <div className="max-w-screen-2xl mx-auto">
          <a href="/" className="flex items-center">
            <img src="/logo.png" className="h-12 mr-3" alt="Wheel Strategy Options Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
              Wheel Strategy Options
            </span>
          </a>
        </div>
      </nav>

      <div className="max-w-screen-2xl mx-auto p-4">
        <div className="mb-4">
          <p className="text-gray-600">
            Find and analyze covered call and cash secured put opportunities for stocks in SP 500. We are working on adding more stocks to the list.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <OptionTabs />
        </div>

        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          <p>
            The data returned by this free screener is for information and educational purposes only. 
            It is not a recommendation to buy or sell a security. All investors should consult a qualified 
            professional before trading in any security. Stock and option trading involves risk and is not 
            suitable for all investors.
          </p>
        </div>
      </div>
    </div>
  );
} 