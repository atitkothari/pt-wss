import { getSinglePost, getPosts, GhostPost } from '@/lib/ghost'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // Revalidate every hour

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

export default async function BlogPost({ params }: BlogPostProps) {
    const post = (await getSinglePost(params.slug)) as GhostPost | null

    if (!post) {
        notFound()
    }

    return (
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
    )
} 