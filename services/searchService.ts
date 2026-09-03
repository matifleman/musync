import { BandSearchDTO, BandSearchResult, mapBandSearchDTOToSearchResult } from '@/types/Band.type'
import { UserSearchDTO, UserSearchResult, mapUserSearchDTOToSearchResult } from '@/types/User.type'
import { apiFetch } from '@/utilities/api'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const searchService = {
  async searchUsers(query: string, pageNumber: number = 1, pageSize: number = 20): Promise<UserSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      })

      const response = await apiFetch(`${API_URL}/users/search?${params.toString()}`, {
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

  async searchBands(
    query: string,
    pageNumber: number = 1,
    pageSize: number = 20,
    instrumentId?: number,
    genreId?: number
  ): Promise<BandSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      const params = new URLSearchParams({
        q: query,
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      })
      if (instrumentId !== undefined) params.set('instrumentId', String(instrumentId))
      if (genreId !== undefined) params.set('genreId', String(genreId))

      const response = await apiFetch(`${API_URL}/bands/search?${params.toString()}`, {
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
