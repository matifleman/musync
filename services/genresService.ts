import { Genre } from '@/types/Band.type'
import { CurrentUser } from '@/types/User.type'
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

  async updateMyGenres(genreIds: number[]): Promise<CurrentUser> {
    const response = await apiFetch(`${API_URL}/users/me/genres`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ genreIds }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.title || errorData.message || `Failed to update genres: ${response.status}`)
    }

    return response.json()
  },
}
