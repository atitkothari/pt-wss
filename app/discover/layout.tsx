import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Options Trading Ideas',
  description: 'Discover trending options trading opportunities, including high IV stocks, upcoming earnings, and top premium yields for both covered calls and cash secured puts.',
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 