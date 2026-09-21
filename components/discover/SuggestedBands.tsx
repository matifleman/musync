import { useDiscoverBands } from '@/hooks/useDiscoverBands'
import { useToggleFollowBand } from '@/hooks/useToggleFollowBand'
import { BandSearchResult } from '@/types/Band.type'
import { router } from 'expo-router'
import React, { useMemo } from 'react'
import SuggestionCard from './SuggestionCard'
import SuggestionsCarousel from './SuggestionsCarousel'

export default function SuggestedBands() {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useDiscoverBands()
  const toggleFollow = useToggleFollowBand()

  const bands = useMemo(() => data?.pages.flat() ?? [], [data])

  return (
    <SuggestionsCarousel<BandSearchResult>
      title="Bands you might like"
      items={bands}
      keyOf={(band) => `band-${band.id}`}
      isLoading={isLoading}
      isError={isError}
      emptyText="No band suggestions right now"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      renderCard={(band) => (
        <SuggestionCard
          image={band.profilePicture ? { uri: band.profilePicture } : null}
          placeholderIcon="library-music"
          title={band.name}
          subtitle={`${band.memberCount} ${band.memberCount === 1 ? 'member' : 'members'}`}
          onPress={() => router.push(`/band/${band.id}`)}
          onFollow={() =>
            toggleFollow.mutate({ bandId: band.id, nextFollowing: true, displayName: band.name })
          }
        />
      )}
    />
  )
}
