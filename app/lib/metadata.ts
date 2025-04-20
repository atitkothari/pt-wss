import { Metadata } from 'next';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function generateMetadata({
  title = 'Wheel Strategy Options - Options Selling Screener',
  description = 'Scan 350,000+ option contracts in seconds. Discover high-yield trades that maximize premium income — with powerful filters built by option sellers for option sellers.',
  path = '',
  image = 'https://wheelstrategyoptions.com/og-image.png',
  type = 'website'
}: GenerateMetadataProps = {}): Metadata {
  const baseUrl = 'https://wheelstrategyoptions.com';
  const url = path ? `${baseUrl}${path}` : baseUrl;

  return {
    title: {
      default: title,
      template: '%s | Options Selling'
    },
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Wheel Strategy Options',
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
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
  };
} 