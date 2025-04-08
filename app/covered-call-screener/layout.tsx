import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Covered Call Screener',
  description: 'Screen for covered call opportunities with our advanced options screener. Find high-yield covered calls that match your investment strategy.',
};

export default function CoveredCallScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 