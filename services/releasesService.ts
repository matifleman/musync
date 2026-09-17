import { ReleaseDetail, ReleaseListItem } from '@/types/Release.type'
import { apiFetch } from '@/utilities/api'
import { resolveReleaseCoverUrl } from '@/utilities/resolverServerImageUrls'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const releasesService = {
  async getBandReleases(bandId: number | string, pageNumber = 1, pageSize = 50): Promise<ReleaseListItem[]> {
    const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
    const response = await apiFetch(`${API_URL}/bands/${bandId}/releases?${params.toString()}`)
    if (!response.ok) throw new Error(`Failed to fetch band releases: ${response.status}`)
    const data: ReleaseListItem[] = await response.json()
    return data.map(resolveReleaseCoverUrl)
  },

  async getRelease(releaseId: number | string): Promise<ReleaseDetail> {
    const response = await apiFetch(`${API_URL}/bands/releases/${releaseId}`)
    if (!response.ok) throw new Error(`Failed to fetch release: ${response.status}`)
    const data: ReleaseDetail = await response.json()
    return resolveReleaseCoverUrl(data)
  },
}
