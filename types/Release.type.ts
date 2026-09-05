import type { components } from './api'
import type { Defined } from './apiTypeHelpers'

export type Song = Defined<components["schemas"]["SongDTO"]>

export type ReleaseListItem = Defined<Omit<components["schemas"]["ReleaseListItemDTO"], "cover">> & {
  cover: string | null
}

export type ReleaseDetail = Defined<Omit<components["schemas"]["ReleaseDetailDTO"], "cover" | "songs">> & {
  cover: string | null
  songs: Song[]
}

export type ReleaseTypeValue = components["schemas"]["ReleaseType"]

export const RELEASE_TYPE_LABELS: Record<ReleaseTypeValue, string> = {
  0: "Single",
  1: "EP",
  2: "Album",
}
