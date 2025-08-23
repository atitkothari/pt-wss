import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/_next/*',
          '/private/*',
          '/temp/*',
          '*.json',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/_next/*',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/_next/*',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://wheelstrategyoptions.com/sitemap.xml',
    host: 'https://wheelstrategyoptions.com',
  }
} 