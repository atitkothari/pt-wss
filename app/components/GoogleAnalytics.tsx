'use client';

import Script from 'next/script';
import Head from 'next/head';

export function GoogleAnalytics() {
  // Only render GA scripts in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Head>
        <meta name="google-adsense-account" content="ca-pub-8741511572242021" />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-MD1P5NTF82"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-MD1P5NTF82');
        `}
      </Script>
    </>
  );
} 