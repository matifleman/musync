import { UserSearchDTO, UserSearchResult, mapUserSearchDTOToSearchResult } from '@/types/User.type'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const searchService = {
  async searchUsers(query: string, session?: string | null): Promise<UserSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Si hay sesión, agregar el token para obtener isFollowed
    // Nota: El endpoint /api/users/search NO requiere autenticación,
    // pero si mandas el token, te retorna isFollowed correctamente
    if (session) {
      try {
        const sessionObj = JSON.parse(session)
        if (sessionObj.token) {
          headers['Authorization'] = `Bearer ${sessionObj.token}`
        }
      } catch (err) {
        console.error('Error parsing session:', err)
        // Continuar sin token, la búsqueda funciona igual
      }
    }

    try {
      const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers,
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

  async followUser(userId: number, session: string): Promise<void> {
    if (!session) {
      throw new Error('Session required to follow users')
    }

    try {
      const sessionObj = JSON.parse(session)
      const token = sessionObj.token

      if (!token) {
        throw new Error('No token found in session')
      }

      const response = await fetch(`${API_URL}/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  async unfollowUser(userId: number, session: string): Promise<void> {
    if (!session) {
      throw new Error('Session required to unfollow users')
    }

    try {
      const sessionObj = JSON.parse(session)
      const token = sessionObj.token

      if (!token) {
        throw new Error('No token found in session')
      }

      const response = await fetch(`${API_URL}/follow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
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