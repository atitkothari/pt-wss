import { getPosts } from '@/lib/ghost'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts()
  
  const blogPosts = posts.map((post: { slug: any; published_at: string | number | Date }) => ({
    url: `https://wheelstrategyoptions.com/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  return [
    {
      url: 'https://wheelstrategyoptions.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://wheelstrategyoptions.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogPosts,
  ]
} 