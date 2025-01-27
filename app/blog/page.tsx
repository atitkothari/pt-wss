import { getPosts, GhostPost } from '@/lib/ghost'
import Link from 'next/link'
import { NavBar } from '@/app/components/NavBar'
import { Metadata } from 'next'
import JsonLd from '@/app/components/JsonLd'

export const metadata: Metadata = {
  title: 'Blog | Wheel Strategy Options',
  description: 'Learn about options trading strategies, wheel strategy, and investment insights.',
  openGraph: {
    title: 'Blog | Wheel Strategy Options',
    description: 'Learn about options trading strategies, wheel strategy, and investment insights.',
    url: 'https://wheelstrategyoptions.com/blog',
    siteName: 'Wheel Strategy Options',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Wheel Strategy Options',
    description: 'Learn about options trading strategies, wheel strategy, and investment insights.',
  }
}

export const revalidate = 300 // Check for new content every minute

export default async function BlogPage() {
    const posts = (await getPosts()) as GhostPost[]

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Wheel Strategy Options Blog',
        description: 'Learn about options trading strategies, wheel strategy, and investment insights.',
        url: 'https://wheelstrategyoptions.com/blog',
        publisher: {
            '@type': 'Organization',
            name: 'Wheel Strategy Options',
            logo: {
                '@type': 'ImageObject',
                url: 'https://wheelstrategyoptions.com/logo.png'
            }
        },
        blogPost: posts.map(post => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            url: `https://wheelstrategyoptions.com/blog/${post.slug}`,
            datePublished: post.published_at,
            image: post.feature_image || undefined,
            author: {
                '@type': 'Organization',
                name: 'Wheel Strategy Options'
            }
        }))
    }

    return (
        <>
            <JsonLd data={blogSchema} />
            <NavBar />
            <main className="min-h-screen bg-gray-900">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Link 
                                href={`/blog/${post.slug}`} 
                                key={post.slug}
                                className="block group"
                            >
                                <article className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105">
                                    {post.feature_image && (
                                        <img 
                                            src={post.feature_image} 
                                            alt={post.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-400 mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                            <span className="mx-2">•</span>
                                            <span>{post.reading_time} min read</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </>
    )
} 