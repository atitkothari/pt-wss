import { MetadataRoute } from 'next'
import { validSymbols } from './lib/valid-symbols';

const baseUrl = 'https://wheelstrategyoptions.com'

// List of valid stock symbols
// const validSymbols = [
//   "A", "AAPL", "ABBV", "ABNB", "ABT", "ACGL", "ACHR", "ACN", "ADBE", "ADI",
//   // ... rest of your symbols
// ];

// Static routes that should always be included
const staticRoutes = [
  {
    url: baseUrl,
    priority: 1,
  },
  {
    url: `${baseUrl}/covered-call-screener`,
    priority: 0.9,
  },
  {
    url: `${baseUrl}/cash-secured-put-screener`,
    priority: 0.8,
  },
  {
    url: `${baseUrl}/discover`,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/options`,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/covered-call-calculator`,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/pricing`,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/available-stocks`,
    priority: 0.5,
  },
  {
    url: `${baseUrl}/available-filters`,
    priority: 0.5,
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
      changeFrequency: 'daily' as const,
    })),
    ...dynamicRoutes,
  ]
} 