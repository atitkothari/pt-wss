import { OptionTabs } from "./components/OptionTabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Option Screener
          </h1>
          <p className="text-gray-600">
            Find and analyze covered call and cash secured put opportunities across various stocks
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <OptionTabs />
        </div>
      </div>
    </main>
  );
}