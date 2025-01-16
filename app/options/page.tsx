import { OptionTabs } from "../components/OptionTabs";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";

export default function OptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-screen-2xl mx-auto p-4">
        <div className="mb-4">
          <p className="text-gray-600">
            Find and analyze covered call and cash secured put opportunities for stocks in SP 500. We are working on adding more stocks to the list.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <OptionTabs />
        </div>

        <Footer />
      </div>
    </div>
  );
} 