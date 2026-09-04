import type { Band, BandFollowResult, CreateBandCommand, FollowedBandsCount, UserBand } from '@/types/Band.type'
import { apiFetch } from '@/utilities/api'
import { resolveBandProfilePictureUrl, resolveUserBandProfilePictureUrl } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const bandsService = {
  async getBand(bandId: number | string): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}`)
    if (!response.ok) throw new Error(`Failed to fetch band: ${response.status}`)
    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },

  async followBand(bandId: number): Promise<BandFollowResult> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/follow`, { method: 'POST' })
    if (!response.ok) throw new Error(`Failed to follow band: ${response.status}`)
    return response.json()
  },

  async unfollowBand(bandId: number): Promise<BandFollowResult> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/follow`, { method: 'DELETE' })
    if (!response.ok) throw new Error(`Failed to unfollow band: ${response.status}`)
    return response.json()
  },

  async createBand(command: CreateBandCommand): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    })

    if (!response.ok) {
      throw new Error(`Failed to create band: ${response.status}`)
    }

    return response.json()
  },

  async updateBandPicture(bandId: number, formData: FormData): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/picture`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to update band picture: ${response.status}`)
    }

    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },

  async updateBandGenres(bandId: number, genreIds: number[]): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/genres`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ genreIds }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update band genres: ${response.status}`)
    }

    return response.json()
  },

  async getBandsByUser(userId: number | string): Promise<UserBand[]> {
    const response = await apiFetch(`${API_URL}/bands/user/${userId}`)
    if (!response.ok) throw new Error(`Failed to fetch user's bands: ${response.status}`)
    const data: UserBand[] = await response.json()
    return data.map(resolveUserBandProfilePictureUrl)
  },

  async getFollowedBandsCount(userId: number | string): Promise<FollowedBandsCount> {
    const response = await apiFetch(`${API_URL}/bands/user/${userId}/followed-count`)
    if (!response.ok) throw new Error(`Failed to fetch followed bands count: ${response.status}`)
    return response.json()
  },

  async joinBand(bandId: number, instrumentId: number): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instrumentId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to join band: ${response.status}`)
    }

    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },

  async leaveBand(bandId: number): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/membership`, { method: 'DELETE' })

    if (!response.ok) {
      throw new Error(`Failed to leave band: ${response.status}`)
    }

    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },

  async updateBandName(bandId: number, name: string): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update band name: ${response.status}`)
    }

    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },

  async updateBandInstruments(bandId: number, instrumentIds: number[]): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/instruments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instrumentIds }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update band instruments: ${response.status}`)
    }

    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },

  async removeMember(bandId: number, userId: number): Promise<Band> {
    const response = await apiFetch(`${API_URL}/bands/${bandId}/members/${userId}`, { method: 'DELETE' })

    if (!response.ok) {
      throw new Error(`Failed to remove member: ${response.status}`)
    }

    const data: Band = await response.json()
    return resolveBandProfilePictureUrl(data)
  },
}
