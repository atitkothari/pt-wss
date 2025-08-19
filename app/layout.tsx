import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import InstallPWA from './components/InstallPWA';
import { MarketingConsentModal } from './components/auth/MarketingConsentModal';
import { MarketingConsentProvider } from './context/MarketingConsentContext';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { sendAnalyticsEvent } from './utils/analytics';
import PlausibleProvider from 'next-plausible';
import { ClarityAnalytics } from './components/ClarityAnalytics';
import { CookieConsentBanner } from '@/components/CookieConsent';
import { hasAcceptedAnalytics } from '@/lib/cookiePreferences';
import Script from 'next/script';
import { Suspense } from "react";
import { ProAnnouncementBanner } from "./components/ProAnnouncementBanner";
import { GlobalErrorHandler } from './components/GlobalErrorHandler';

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
  description: 'Scan 570,000+ option contracts in seconds. Discover high-yield trades that maximize premium income — with powerful filters built by option sellers for option sellers. Find the best covered calls and cash-secured puts for the wheel strategy.',
  keywords: ['options trading', 'wheel strategy', 'covered calls', 'cash secured puts', 'options screener', 'selling options', 'options selling'],
  metadataBase: new URL('https://wheelstrategyoptions.com'),
  openGraph: {
    title: 'Wheel Strategy Options - Options Selling Screener',
    description: 'Scan 570,000+ option contracts in seconds. Discover options to maximize premium income — with powerful platform built by option sellers for option sellers.',
    url: 'https://wheelstrategyoptions.com',
    siteName: 'Wheel Strategy Options',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wheel Strategy Options - Options Selling Screener',
    description: 'Scan 570,000+ option contracts in seconds. Discover options to maximize premium income — with powerful platform built by option sellers for option sellers.',
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
        {hasAcceptedAnalytics() && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1084347710126303');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
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
            <MarketingConsentProvider>
              <GlobalErrorHandler>
                <main>
                  <Suspense fallback={null}>
                    <ProAnnouncementBanner />
                  </Suspense>
                  {children}
                </main>
                <Toaster />
                <InstallPWA />
                <MarketingConsentModal autoShow={true} />
                <CookieConsentBanner />
              </GlobalErrorHandler>
            </MarketingConsentProvider>
          </SubscriptionProvider>
        </AuthProvider>
        {hasAcceptedAnalytics() && (
          <noscript>
            <img height="1" width="1" style={{display: 'none'}} src="https://www.facebook.com/tr?id=1084347710126303&ev=PageView&noscript=1" />
          </noscript>
        )}
        {hasAcceptedAnalytics() && (
          <Script id="mautic-tracking" strategy="afterInteractive">
            {`
              (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
                  w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
                  m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
              })(window,document,'script','https://mautic.wheelstrategyoptions.com/mtc.js','mt');

              mt('send', 'pageview');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
