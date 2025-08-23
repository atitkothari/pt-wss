import { Metadata } from 'next';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export function generateMetadata({
  title = 'Wheel Strategy Options - Options Selling Screener',
  description = 'Scan 570,000+ option contracts in seconds. Discover high-yield trades that maximize premium income — with powerful filters built by option sellers for option sellers.',
  path = '',
  image = 'https://wheelstrategyoptions.com/og-image.png',
  type = 'website',
  keywords = ['options trading', 'wheel strategy', 'covered calls', 'cash secured puts', 'options screener', 'selling options', 'options selling', 'premium income', 'options trading platform'],
  author = 'Wheel Strategy Options',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: GenerateMetadataProps = {}): Metadata {
  const baseUrl = 'https://wheelstrategyoptions.com';
  const url = path ? `${baseUrl}${path}` : baseUrl;
  const fullTitle = path ? `${title} | Wheel Strategy Options` : title;

  return {
    title: {
      default: fullTitle,
      template: '%s | Wheel Strategy Options'
    },
    description,
    keywords: [...keywords, ...tags],
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Wheel Strategy Options',
      type,
      locale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: 'image/png',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@wheelstrategy',
      site: '@wheelstrategy',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'G-MD1P5NTF82',
      yandex: 'verification_token',
      yahoo: 'verification_token',
    },
    category: 'Finance',
    classification: 'Options Trading Platform',
    other: {
      'google-adsense-account': 'ca-pub-8741511572242021',
      'msapplication-TileColor': '#000000',
      'theme-color': '#000000',
    },
  };
} 