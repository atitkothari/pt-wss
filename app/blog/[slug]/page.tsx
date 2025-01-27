import { getSinglePost, getPosts, GhostPost } from '@/lib/ghost'
import { notFound } from 'next/navigation'
import { NavBar } from '@/app/components/NavBar'
import { Metadata } from 'next'
import JsonLd from '@/app/components/JsonLd'

export const revalidate = 60 // Revalidate every minute

// Add this function to generate static params
export async function generateStaticParams() {
    const posts = await getPosts()
    return posts.map((post: GhostPost) => ({
        slug: post.slug
    }))
}

interface BlogPostProps {
    params: {
        slug: string
    }
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
    const post = await getSinglePost(params.slug) as GhostPost
    
    if (!post) {
        return {
            title: 'Post Not Found | Wheel Strategy Options'
        }
    }

    return {
        title: `${post.title} | Wheel Strategy Options`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `https://wheelstrategyoptions.com/blog/${post.slug}`,
            siteName: 'Wheel Strategy Options',
            type: 'article',
            images: post.feature_image ? [{ url: post.feature_image }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: post.feature_image ? [post.feature_image] : [],
        }
    }
}

export default async function BlogPost({ params }: BlogPostProps) {
    const post = (await getSinglePost(params.slug)) as GhostPost | null

    if (!post) {
        notFound()
    }

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.feature_image || undefined,
        datePublished: post.published_at,
        author: {
            '@type': 'Organization',
            name: 'Wheel Strategy Options'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Wheel Strategy Options',
            logo: {
                '@type': 'ImageObject',
                url: 'https://wheelstrategyoptions.com/logo.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://wheelstrategyoptions.com/blog/${post.slug}`
        },
        articleBody: post.html.replace(/<[^>]*>/g, ''), // Strip HTML tags
        keywords: post.tags?.map(tag => tag.name).join(',')
    }

    return (
        <>
            <JsonLd data={articleSchema} />
            <NavBar />
            <main className="min-h-screen bg-gray-900">
                <article className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {post.feature_image && (
                        <img 
                            src={post.feature_image} 
                            alt={post.title}
                            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                        />
                    )}
                    <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
                    <div className="flex items-center text-sm text-gray-500 mb-8">
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{post.reading_time} min read</span>
                        {post.tags && post.tags.length > 0 && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{post.tags.map(tag => tag.name).join(', ')}</span>
                            </>
                        )}
                    </div>
                    <div 
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                </article>
            </main>
        </>
    )
} 