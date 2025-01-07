import { OptionTabs } from "../components/OptionTabs";

export default function OptionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            The Wheel Strategy Screener
          </h1>
          <p className="text-gray-600">
            Find and analyze covered call and cash secured put opportunities for stocks in SP 500. We are working on adding more stocks to the list.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <OptionTabs />
        </div>
      </div>
    </main>
  );
} 