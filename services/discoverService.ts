import { BandSearchDTO, BandSearchResult, mapBandSearchDTOToSearchResult } from '@/types/Band.type'
import { UserSearchDTO, UserSearchResult, mapUserSearchDTOToSearchResult } from '@/types/User.type'
import { apiError, apiFetch } from '@/utilities/api'

const API_URL = process.env.EXPO_PUBLIC_API_URL

// Suggestions come back in the same shapes as search results, so they reuse the
// search mappers and render with the same types. Both lists are pre-ranked by
// the server: shared genres/instruments first, then popularity.
export const discoverService = {
  async getSuggestedUsers(pageNumber = 1, pageSize = 20): Promise<UserSearchResult[]> {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
    const response = await apiFetch(`${API_URL}/discover/users?${params.toString()}`)
    if (!response.ok) throw await apiError(response, 'Failed to load suggested musicians')
    const dtos: UserSearchDTO[] = await response.json()
    return dtos.map(mapUserSearchDTOToSearchResult)
  },

  async getSuggestedBands(pageNumber = 1, pageSize = 20): Promise<BandSearchResult[]> {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
    const response = await apiFetch(`${API_URL}/discover/bands?${params.toString()}`)
    if (!response.ok) throw await apiError(response, 'Failed to load suggested bands')
    const dtos: BandSearchDTO[] = await response.json()
    return dtos.map(mapBandSearchDTOToSearchResult)
  },
}
