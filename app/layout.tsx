import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { AuthContextProvider } from './context/AuthContext';
import InstallPWA from './components/InstallPWA';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Wheel Strategy Options - Options Selling Screener',
    template: '%s | Wheel Strategy Options - Options Selling'
  },
  description: 'Screen for high-yield options trades and selling opportunities using our advanced options screener. Find the best covered calls and cash-secured puts for the wheel strategy.',
  keywords: ['options trading', 'wheel strategy', 'covered calls', 'cash secured puts', 'options screener', 'selling options', 'options selling'],
  metadataBase: new URL('https://wheelstrategyoptions.com'),
  openGraph: {
    title: 'Wheel Strategy Options - Options Selling Screener',
    description: 'Screen for high-yield options trades and selling opportunities using our advanced options screener.',
    url: 'https://wheelstrategyoptions.com',
    siteName: 'Wheel Strategy Options',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wheel Strategy Options - Options Selling Screener',
    description: 'Screen for high-yield options trades and selling opportunities using our advanced options screener.',
  },
  verification: {
    google: 'G-MD1P5NTF82',
  },
  other: {
    'google-adsense-account': 'ca-pub-8741511572242021',
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wheel Strategy Options',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wheel Strategy Options" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PPJGRHST"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        <GoogleAnalytics />
        <AuthContextProvider>
          <main>
            {children}
          </main>
          <Toaster />
          <InstallPWA />
        </AuthContextProvider>
      </body>
    </html>
  );
}
