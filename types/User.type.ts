export type Instrument = {
  id: number
  name: string
  image: string
}

// Tipo principal del usuario (el que usas en tu app)
export type User = {
  id: number
  firstName: string
  lastName: string
  userName: string
  age: number
  email: string
  profilePicture: string
  followersCount: number
  followedCount: number
  isFollowed: boolean
  favoriteInstruments: Instrument[]
}

// Tipo para búsqueda de usuarios (viene del endpoint /api/users/search)
export interface UserSearchDTO {
  id: number
  firstName: string
  lastName: string
  userName: string
  profilePicture: string
  followersCount: number
  isFollowed: boolean
}

// Tipo para la UI de búsqueda
export interface UserSearchResult {
  id: number
  username: string
  nombre: string
  foto: string
  followersCount: number
  siguiendo: boolean
}

// Helper para convertir UserSearchDTO a UserSearchResult para la UI
export function mapUserSearchDTOToSearchResult(dto: UserSearchDTO): UserSearchResult {
  return {
    id: dto.id,
    username: dto.userName,
    nombre: `${dto.firstName} ${dto.lastName}`,
    foto: `${process.env.EXPO_PUBLIC_SERVER_URL}/${dto.profilePicture}`,
    followersCount: dto.followersCount,
    siguiendo: dto.isFollowed,
  }
}