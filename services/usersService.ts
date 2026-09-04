import type { components } from '@/types/api'
import type { Defined } from '@/types/apiTypeHelpers'
import { CurrentUser, User } from '@/types/User.type'
import { apiFetch } from '@/utilities/api'
import { resolveUserProfilePictureUrl } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

// The target user's new followersCount and the acting (current) user's new
// followingCount, so callers can apply both sides of a follow/unfollow from
// one server-authoritative response instead of guessing at +1/-1 locally.
export type FollowResult = Defined<components["schemas"]["FollowResultDTO"]>

export type UpdateProfileRequest = Defined<components["schemas"]["UpdateProfileCommand"]>

export const usersService = {
  async getUser(userId: number | string): Promise<User> {
    const response = await apiFetch(`${API_URL}/users/${userId}`)
    if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`)
    const data: User = await response.json()
    return resolveUserProfilePictureUrl(data)
  },

  async updateAvatar(formData: FormData): Promise<CurrentUser> {
    const response = await apiFetch(`${API_URL}/users/me/avatar`, {
      method: 'PUT',
      body: formData,
    })
    if (!response.ok) throw new Error(`Failed to update avatar: ${response.status}`)
    const data: CurrentUser = await response.json()
    return resolveUserProfilePictureUrl(data)
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<CurrentUser> {
    const response = await apiFetch(`${API_URL}/users/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.title || errorData.message || `Failed to update profile: ${response.status}`)
    }
    const data: CurrentUser = await response.json()
    return resolveUserProfilePictureUrl(data)
  },

  async followUser(userId: number): Promise<FollowResult> {
    const response = await apiFetch(`${API_URL}/follow/${userId}`, { method: 'POST' })
    if (!response.ok) throw new Error(`Failed to follow user: ${response.status}`)
    return response.json()
  },

  async unfollowUser(userId: number): Promise<FollowResult> {
    const response = await apiFetch(`${API_URL}/follow/${userId}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(`Failed to unfollow user: ${response.status}`)
    return response.json()
  },
}
