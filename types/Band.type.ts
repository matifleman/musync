import type { components } from './api'
import type { Defined } from './apiTypeHelpers'
import { Instrument } from './User.type'

export type Genre = Defined<components["schemas"]["GenreDTO"]>

// profilePicture stays nullable — a freshly created band has none until the
// separate picture upload call succeeds, unlike Post.image/User.profilePicture
// which are always present.
export type Band = Defined<Omit<components["schemas"]["BandDTO"], "profilePicture" | "genres" | "requiredInstruments" | "members" | "vacantInstruments">> & {
  profilePicture: string | null
  genres: Genre[]
  requiredInstruments: Instrument[]
  members: Defined<components["schemas"]["BandMemberDTO"]>[]
  vacantInstruments: Instrument[]
}

export type CreateBandCommand = Defined<components["schemas"]["CreateBandCommand"]>

export type BandSearchDTO = Defined<components["schemas"]["BandSearchDTO"]>

export interface BandSearchResult {
  id: number
  name: string
  memberCount: number
}

export function mapBandSearchDTOToSearchResult(dto: BandSearchDTO): BandSearchResult {
  return {
    id: dto.id,
    name: dto.name,
    memberCount: dto.memberCount,
  }
}

export type BandFollowResult = Defined<components["schemas"]["BandFollowResultDTO"]>

export type FollowedBandsCount = Defined<components["schemas"]["FollowedBandsCountDTO"]>

// profilePicture/instrumentId/instrumentName stay nullable — a leader may have
// no picture set on the band, and may not occupy an instrument slot themselves.
export type UserBand = Defined<Omit<components["schemas"]["UserBandDTO"], "profilePicture" | "instrumentId" | "instrumentName">> & {
  profilePicture: string | null
  instrumentId: number | null
  instrumentName: string | null
}
