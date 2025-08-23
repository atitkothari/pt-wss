import { MetadataRoute } from 'next'
import { validSymbols } from './lib/valid-symbols';

const baseUrl = 'https://wheelstrategyoptions.com'

// Static routes that should always be included
const staticRoutes = [
  {
    url: baseUrl,
    priority: 1.0,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/covered-call-screener`,
    priority: 0.9,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/cash-secured-put-screener`,
    priority: 0.9,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/discover`,
    priority: 0.8,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/options`,
    priority: 0.8,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/covered-call-calculator`,
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  },
  {
    url: `${baseUrl}/pricing`,
    priority: 0.7,
    changeFrequency: 'weekly' as const,
  },
  {
    url: `${baseUrl}/available-stocks`,
    priority: 0.6,
    changeFrequency: 'weekly' as const,
  },
  {
    url: `${baseUrl}/available-filters`,
    priority: 0.6,
    changeFrequency: 'weekly' as const,
  },
  {
    url: `${baseUrl}/trade-tracker`,
    priority: 0.7,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/watchlist`,
    priority: 0.6,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/saved-screeners`,
    priority: 0.6,
    changeFrequency: 'daily' as const,
  },
  {
    url: `${baseUrl}/manage-subscription`,
    priority: 0.5,
    changeFrequency: 'monthly' as const,
  },
  {
    url: `${baseUrl}/faq`,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  },
]

// Function to generate dynamic routes
async function generateDynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  // Generate routes for each stock symbol for both covered calls and cash secured puts
  const stockRoutes = validSymbols.flatMap(symbol => [
    {
      url: `${baseUrl}/covered-call/${symbol}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cash-secured-put/${symbol}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }
  ]);

  return stockRoutes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await generateDynamicRoutes()
  
  return [
    ...staticRoutes.map(route => ({
      ...route,
      lastModified: new Date(),
    })),
    ...dynamicRoutes,
  ]
} 