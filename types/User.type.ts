import type { components } from './api'
import type { Defined } from './apiTypeHelpers'

export type Instrument = Defined<components["schemas"]["InstrumentDTO"]>

// Tipo principal del usuario (el que usas en tu app)
export type User = Defined<Omit<components["schemas"]["UserDTO"], "favoriteInstruments">> & {
  favoriteInstruments: Instrument[]
}

// The authenticated user (includes email) — only used for responses about the
// caller's own account: login/register/refresh, GET /users/me, PUT /users/me/*
export type CurrentUser = Defined<Omit<components["schemas"]["CurrentUserDTO"], "favoriteInstruments">> & {
  favoriteInstruments: Instrument[]
}

// Tipo para búsqueda de usuarios (viene del endpoint /api/users/search)
export type UserSearchDTO = Defined<components["schemas"]["UserSearchDTO"]>

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
