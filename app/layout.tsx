import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from './components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Options Screener',
  description: 'Screen for covered calls and cash-secured puts',
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
