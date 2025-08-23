import { Metadata } from "next";
import { generateFAQSchema } from "@/app/lib/structured-data";
import { Footer } from "../components/Footer";
import { PageLayout } from "../components/PageLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions About Options Trading",
  description:
    "Get answers to common questions about options trading, the wheel strategy, and how to use our options screener effectively.",
  keywords: [
    "options trading FAQ",
    "wheel strategy questions",
    "options screener help",
    "covered calls FAQ",
    "cash secured puts FAQ",
    "trading questions",
  ],
};

export default function FAQPage() {
  const faqData = [
    {
      question: "What is the Wheel Strategy?",
      answer:
        "The Wheel Strategy is an options trading approach that involves selling cash-secured puts to collect premium income, and if assigned, selling covered calls on the acquired stock. This creates a continuous cycle of premium income generation.",
    },
    {
      question: "How does your options screener work?",
      answer:
        "Our screener scans over 570,000 option contracts in real-time, applying your custom filters to find the best opportunities. You can filter by Delta, IV, expiration date, premium yield, and many other criteria to match your risk tolerance and investment goals.",
    },
    {
      question: "What is a covered call?",
      answer:
        "A covered call is an options strategy where you sell call options against stock you already own. This generates premium income while potentially limiting upside if the stock price rises significantly above the strike price.",
    },
    {
      question: "What is a cash-secured put?",
      answer:
        "A cash-secured put involves selling put options while having enough cash to buy the underlying stock if assigned. This strategy generates premium income and potentially allows you to acquire stock at a discount.",
    },
    {
      question: "How do I calculate potential returns?",
      answer:
        "Returns are calculated based on the premium received divided by the capital required. For covered calls, it's premium ÷ stock price. For cash-secured puts, it's premium ÷ strike price. Our calculator automatically computes these metrics.",
    },
    {
      question: "What filters should I use for conservative trading?",
      answer:
        "Conservative traders typically use higher Delta values (0.7-0.9), lower IV, longer expiration dates (30-45 days), and focus on established, liquid stocks with good fundamentals.",
    },
    {
      question: "How often should I check for new opportunities?",
      answer:
        "We recommend checking daily as market conditions change rapidly. You can save your favorite screeners and get notifications when new opportunities match your criteria.",
    },
    {
      question: "What is implied volatility (IV) and why does it matter?",
      answer:
        "Implied volatility represents the market's expectation of future price movement. Higher IV means higher option premiums, but also higher risk. IV typically increases before earnings and decreases after.",
    },
    {
      question: "How do I manage risk with the wheel strategy?",
      answer:
        "Risk management includes diversifying across multiple stocks, setting position size limits, using stop-loss orders, and avoiding over-concentration in any single sector or stock.",
    },
    {
      question: "Can I use this platform for day trading?",
      answer:
        "While our platform is designed for swing trading and longer-term strategies, you can use it for day trading. However, the wheel strategy typically works best with longer timeframes.",
    },
    {
      question: "What happens if my covered call gets assigned?",
      answer:
        "If assigned, your stock will be sold at the strike price. You'll receive the strike price × number of shares, plus you keep the premium. You can then sell cash-secured puts to potentially repurchase the stock.",
    },
    {
      question: "How do I track my trades and performance?",
      answer:
        "Use our Trade Tracker to log all your trades, calculate P&L, and analyze performance. This helps you identify which strategies work best and optimize your approach over time.",
    },
    {
      question: "What's the difference between bid and ask prices?",
      answer:
        "The bid price is what buyers are willing to pay, while the ask price is what sellers are asking for. The spread between them represents the market maker's profit and your transaction cost.",
    },
    {
      question: "How do earnings affect options trading?",
      answer:
        "Earnings announcements typically increase implied volatility, making options more expensive. Many traders avoid holding options through earnings due to increased uncertainty and potential for large price swings.",
    },
    {
      question: "What is Delta and how do I use it?",
      answer:
        "Delta measures how much an option's price changes relative to the underlying stock. Higher Delta means the option behaves more like the stock. For income generation, many traders prefer Delta between 0.3-0.7.",
    },
  ];

  // Generate FAQ schema for SEO
  const faqSchema = generateFAQSchema(faqData);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-center text-gray-600 mb-12">
            Get answers to common questions about options trading, the wheel
            strategy, and our platform.
          </p>

          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/options"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Our Screener
              </Link>
              <Link
                href="/pricing"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Footer />
    </PageLayout>
  );
}
