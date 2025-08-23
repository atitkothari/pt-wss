import { LandingPageClient } from "@/app/components/LandingPageClient";
import { generateMetadata } from "@/app/lib/metadata";
import { generateFAQSchema, generateOrganizationSchema } from "@/app/lib/structured-data";

export const metadata = generateMetadata({
  title: 'Wheel Strategy Options Screener | High-Yield Trades',
  description: 'Master the Wheel Strategy with our AI-powered options screener. Find high-yield covered calls and cash secured puts in seconds. Start your free trial today!',
  path: '/',
});

export default function LandingPage() {
  const faqQuestions = [
    {
      question: "What is the Wheel Strategy?",
      answer: "The Wheel Strategy is an options trading strategy that involves selling cash-secured puts and covered calls to generate consistent income from premiums."
    },
    {
      question: "How does the options screener work?",
      answer: "Our AI-powered screener scans over 570,000 option contracts in real-time to identify the most profitable trades based on your custom filters, such as premium yield, delta, and IV."
    },
    {
      question: "Is this tool suitable for beginners?",
      answer: "Yes! We provide educational resources and a user-friendly interface to help traders of all levels master the Wheel Strategy. Our tool simplifies the process of finding and analyzing trades."
    },
    {
      question: "Can I try it for free?",
      answer: "Absolutely. We offer a 5-day free trial with full access to all features, no credit card required. Experience the power of our options screener for yourself."
    }
  ];

  const organizationSchema = generateOrganizationSchema({
    name: "Wheel Strategy Options",
    url: "https://wheelstrategyoptions.com",
    logo: "https://wheelstrategyoptions.com/logo.png",
    description: "AI-powered options screener for the Wheel Strategy."
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqQuestions)) }}
      />
      <LandingPageClient faqQuestions={faqQuestions} />
    </>
  );
}