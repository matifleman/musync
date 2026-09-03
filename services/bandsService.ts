import type { Band, CreateBandCommand } from '@/types/Band.type'
import { apiFetch } from '@/utilities/api'
import { resolveBandProfilePictureUrl } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const bandsService = {
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
}
