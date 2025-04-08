import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cash Secured Put Screener',
  description: 'Screen for cash secured put opportunities with our advanced options screener. Find high-yield CSPs that match your investment strategy.',
};

export default function CashSecuredPutScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 