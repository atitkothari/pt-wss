import GhostContentAPI from '@tryghost/content-api'

// Create API instance with your Ghost credentials
const api = new GhostContentAPI({
    url: process.env.NEXT_PUBLIC_GHOST_URL || 'https://ghost.wheelstrategyoptions.com',
    key: process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY || 'cad675fd1472b2cd797893e8d8',
    version: 'v5.0'
})

// Define types for Ghost posts
export interface GhostPost {
    title: string
    slug: string
    html: string
    feature_image: string
    excerpt: string
    published_at: string
    reading_time: number
    tags: Array<{
        name: string
        slug: string
    }>
}

// Export functions to fetch posts
export async function getPosts() {
    return await api.posts
        .browse({
            limit: 'all',
            include: ['tags'],
        })
        .catch(err => {
            console.error(err)
            return []
        })
}

export async function getSinglePost(postSlug: string) {
    return await api.posts
        .read({
            slug: postSlug,
        }, {
            include: ['tags'],
        })
        .catch(err => {
            console.error(err)
            return null
        })
} 