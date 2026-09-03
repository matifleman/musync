import { Genre } from '@/types/Band.type'
import { apiFetch } from '@/utilities/api'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const genresService = {
  async getGenres(): Promise<Genre[]> {
    const response = await apiFetch(`${API_URL}/genres`)

    if (!response.ok) {
      throw new Error(`Failed to fetch genres: ${response.status}`)
    }

    return response.json()
  },
}
