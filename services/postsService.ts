import { Post } from '@/types/Post.type'
import { apiFetch } from '@/utilities/api'
import { resolveServerImageUrls } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const postsService = {
  async getPosts(): Promise<Post[]> {
    const response = await apiFetch(`${API_URL}/posts`)
    if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`)
    const data: Post[] = await response.json()
    return resolveServerImageUrls(data)
  },

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    const response = await apiFetch(`${API_URL}/posts/author/${authorId}`)
    if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`)
    const data: Post[] = await response.json()
    return resolveServerImageUrls(data)
  },

  async createPost(formData: FormData): Promise<Post> {
    const response = await apiFetch(`${API_URL}/posts`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error(`Failed to create post: ${response.status}`)
    return response.json()
  },

  async likePost(postId: number): Promise<void> {
    const response = await apiFetch(`${API_URL}/posts/${postId}/like`, { method: 'POST' })
    if (!response.ok) throw new Error(`Failed to like post: ${response.status}`)
  },

  async unlikePost(postId: number): Promise<void> {
    const response = await apiFetch(`${API_URL}/posts/${postId}/like`, { method: 'DELETE' })
    if (!response.ok) throw new Error(`Failed to unlike post: ${response.status}`)
  },
}
