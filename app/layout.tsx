import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import InstallPWA from './components/InstallPWA';
import { MarketingConsentPopup } from './components/auth/MarketingConsentPopup';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { sendAnalyticsEvent } from './utils/analytics';
import PlausibleProvider from 'next-plausible';
import { ClarityAnalytics } from './components/ClarityAnalytics';
import { CookieConsentBanner } from '@/components/CookieConsent';
import { hasAcceptedAnalytics } from '@/lib/cookiePreferences';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'Wheel Strategy Options - Options Selling Screener',
    template: '%s | Options Selling'
  },
  description: 'Scan 350,000+ option contracts in seconds. Discover high-yield trades that maximize premium income — with powerful filters built by option sellers for option sellers. Find the best covered calls and cash-secured puts for the wheel strategy.',
  keywords: ['options trading', 'wheel strategy', 'covered calls', 'cash secured puts', 'options screener', 'selling options', 'options selling'],
  metadataBase: new URL('https://wheelstrategyoptions.com'),
  openGraph: {
    title: 'Wheel Strategy Options - Options Selling Screener',
    description: 'Scan 350,000+ option contracts in seconds. Discover options to maximize premium income — with powerful platform built by option sellers for option sellers.',
    url: 'https://wheelstrategyoptions.com',
    siteName: 'Wheel Strategy Options',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wheel Strategy Options - Options Selling Screener',
    description: 'Scan 350,000+ option contracts in seconds. Discover options to maximize premium income — with powerful platform built by option sellers for option sellers.',
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
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preload"
          href="/_next/static/media/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-8741511572242021" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8741511572242021" crossOrigin="anonymous" />
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
      <body className={`${inter.className} antialiased`}>
        <ClarityAnalytics />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PPJGRHST"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {hasAcceptedAnalytics() && (
          <PlausibleProvider
            domain="wheelstrategyoptions.com"
            trackOutboundLinks={true}
            hash={true}          
            scriptProps={{
              src: "https://pl-plausible.194.195.92.250.sslip.io/js/script.js",
            }}
          >
            <GoogleAnalytics />
          </PlausibleProvider>
        )}
        <AuthProvider>
          <SubscriptionProvider>
            <main>
              <AnnouncementBanner 
                id="api-announcement"
                message="🎉 Limited Time Offer: Get 50% OFF your first month! Only $9.99 instead of $19.99"
                link={{
                  text: "Upgrade to Pro",
                  href: "/pricing"
                }}
                analyticsEventName="upgrade_to_pro_banner"
                className="bg-gradient-to-r from-blue-600 to-blue-500"
                countdownDate={new Date('2025-05-13')}
              />
              {children}
            </main>
            <Toaster />
            <InstallPWA />
            <MarketingConsentPopup />
            <CookieConsentBanner />
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
