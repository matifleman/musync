import { BandSearchDTO, BandSearchResult, mapBandSearchDTOToSearchResult } from '@/types/Band.type'
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

  async searchBands(query: string): Promise<BandSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      const response = await apiFetch(`${API_URL}/bands/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const dtos: BandSearchDTO[] = await response.json()
      return dtos.map(mapBandSearchDTOToSearchResult)
    } catch (error) {
      console.error('Error in searchBands:', error)
      throw error
    }
  },
}
