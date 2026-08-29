import { CurrentUser, Instrument } from '@/types/User.type'
import { apiFetch } from '@/utilities/api'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const instrumentsService = {
  async getInstruments(): Promise<Instrument[]> {
    const response = await apiFetch(`${API_URL}/instruments`)

    if (!response.ok) {
      throw new Error(`Failed to fetch instruments: ${response.status}`)
    }

    return response.json()
  },

  async updateMyInstruments(instrumentIds: number[]): Promise<CurrentUser> {
    const response = await apiFetch(`${API_URL}/users/me/instruments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instrumentIds }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.title || errorData.message || `Failed to update instruments: ${response.status}`)
    }

    return response.json()
  },
}
