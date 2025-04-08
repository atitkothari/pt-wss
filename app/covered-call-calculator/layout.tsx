import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Covered Call Calculator',
  description: 'Calculate potential income from selling covered calls on stocks you own. Use our calculator to estimate returns and find the best covered call opportunities.',
};

export default function CoveredCallCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 