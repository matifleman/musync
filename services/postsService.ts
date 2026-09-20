import type { components } from '@/types/api'
import { Post } from '@/types/Post.type'
import { apiError, apiFetch } from '@/utilities/api'
import { resolvePostImageUrls, resolveServerImageUrls } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

// Not wrapped in Defined<>: a null caption is exactly the value we need to send
// when the author clears it.
export type UpdatePostCaptionRequest = components["schemas"]["UpdatePostCaptionRequest"]

export const postsService = {
  async getFeed(pageNumber = 1, pageSize = 20): Promise<Post[]> {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
    const response = await apiFetch(`${API_URL}/posts/feed?${params.toString()}`)
    if (!response.ok) throw new Error(`Failed to fetch feed: ${response.status}`)
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
    // Returned as-is: this response carries `author: null`, so it can't go
    // through resolvePostImageUrls. Callers refetch instead of using it.
    return response.json()
  },

  async getPost(postId: number): Promise<Post> {
    const response = await apiFetch(`${API_URL}/posts/${postId}`)
    if (!response.ok) throw await apiError(response, 'Failed to fetch post')
    const data: Post = await response.json()
    return resolvePostImageUrls(data)
  },

  async updatePostCaption(postId: number, caption: string): Promise<Post> {
    const body: UpdatePostCaptionRequest = { caption }
    const response = await apiFetch(`${API_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw await apiError(response, 'Failed to update caption')
    const data: Post = await response.json()
    return resolvePostImageUrls(data)
  },

  // 204 No Content — never parse a body here.
  async deletePost(postId: number): Promise<void> {
    const response = await apiFetch(`${API_URL}/posts/${postId}`, { method: 'DELETE' })
    if (!response.ok) throw await apiError(response, 'Failed to delete post')
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
