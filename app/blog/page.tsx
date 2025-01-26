import { getPosts, GhostPost } from '@/lib/ghost'
import Link from 'next/link'

export const revalidate = 3600 // Revalidate every hour

export default async function BlogPage() {
    const posts = (await getPosts()) as GhostPost[]

    return (
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
    )
} 