import { UserSearchDTO, UserSearchResult, mapUserSearchDTOToSearchResult } from '@/types/User.type'
import { apiFetch } from '@/utilities/api'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const searchService = {
  async searchUsers(query: string, session?: string | null): Promise<UserSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      const response = await apiFetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const dtos: UserSearchDTO[] = await response.json()
      return dtos.map(mapUserSearchDTOToSearchResult)
    } catch (error) {
      console.error('Error in searchUsers:', error)
      throw error
    }
  },

  async followUser(userId: number): Promise<void> {
    try {
      const response = await apiFetch(`${API_URL}/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to follow user: ${response.status}`)
      }
    } catch (error) {
      console.error('Error in followUser:', error)
      throw error
    }
  },

  async unfollowUser(userId: number): Promise<void> {
    try {
      const response = await apiFetch(`${API_URL}/follow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to unfollow user: ${response.status}`)
      }
    } catch (error) {
      console.error('Error in unfollowUser:', error)
      throw error
    }
  },
}