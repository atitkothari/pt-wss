import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from './components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Options, Smarter Returns: Screen, Select, Succeed',
  description: 'Dominate the options game. Our options screener delivers high-yield options trades maximizing premium income with real-time options data and intelligent filters. Select your perfect strategy; succeed in seconds.',
  metadataBase: new URL('https://wheelstrategyoptions.com/'),
  other: {
    'google-adsense-account': 'ca-pub-8741511572242021',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-8741511572242021" />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
