import { useDiscoverUsers } from '@/hooks/useDiscoverUsers'
import { useToggleFollowUser } from '@/hooks/useToggleFollowUser'
import { UserSearchResult } from '@/types/User.type'
import { router } from 'expo-router'
import React, { useMemo } from 'react'
import SuggestionCard from './SuggestionCard'
import SuggestionsCarousel from './SuggestionsCarousel'

const DEFAULT_AVATAR = require('@/assets/dummyImages/avatars/avatar0.jpg')

// Self-contained so it can be dropped anywhere suggestions are wanted - the
// search tab now, the onboarding flow's "follow suggestions" step later.
export default function SuggestedMusicians() {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useDiscoverUsers()
  // Once per carousel, target passed as a variable: a hook can't live in a card
  // rendered per row.
  const toggleFollow = useToggleFollowUser()

  const users = useMemo(() => data?.pages.flat() ?? [], [data])

  return (
    <SuggestionsCarousel<UserSearchResult>
      title="Suggested musicians"
      items={users}
      keyOf={(user) => `user-${user.id}`}
      isLoading={isLoading}
      isError={isError}
      emptyText="No suggestions right now"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      renderCard={(user) => (
        <SuggestionCard
          image={user.foto ? { uri: user.foto } : DEFAULT_AVATAR}
          placeholderIcon="person"
          title={user.username}
          subtitle={`${user.followersCount} ${user.followersCount === 1 ? 'follower' : 'followers'}`}
          onPress={() => router.push(`/user/${user.id}`)}
          onFollow={() =>
            toggleFollow.mutate({ userId: user.id, nextFollowing: true, displayName: `@${user.username}` })
          }
        />
      )}
    />
  )
}
