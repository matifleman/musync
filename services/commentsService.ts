import type { components } from '@/types/api'
import { Comment } from '@/types/Comment.type'
import { apiError, apiFetch } from '@/utilities/api'
import { resolveUserProfilePictureUrl } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export type CreateCommentRequest = components["schemas"]["CreateCommentRequest"]

// The author's avatar comes back server-relative, like every other user payload.
// resolveUserProfilePictureUrl is idempotent, so re-resolving a cached comment is safe.
const resolveCommentAuthorUrl = (comment: Comment): Comment => ({
  ...comment,
  author: resolveUserProfilePictureUrl(comment.author),
})

export const commentsService = {
  // Pages come back newest-first, so page 1 is what the modal opens on.
  async getComments(postId: number, pageNumber = 1, pageSize = 20): Promise<Comment[]> {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
    const response = await apiFetch(`${API_URL}/posts/${postId}/comments?${params.toString()}`)
    if (!response.ok) throw await apiError(response, 'Failed to fetch comments')
    const data: Comment[] = await response.json()
    return data.map(resolveCommentAuthorUrl)
  },

  async addComment(postId: number, text: string): Promise<Comment> {
    const body: CreateCommentRequest = { text }
    const response = await apiFetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw await apiError(response, 'Failed to add comment')
    const data: Comment = await response.json()
    return resolveCommentAuthorUrl(data)
  },

  // 204 No Content on success, so there is no body to parse.
  async deleteComment(commentId: number): Promise<void> {
    const response = await apiFetch(`${API_URL}/comments/${commentId}`, { method: 'DELETE' })
    if (!response.ok) throw await apiError(response, 'Failed to delete comment')
  },
}
