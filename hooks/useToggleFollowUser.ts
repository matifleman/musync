import { usersService } from "@/services/usersService";
import { useSession } from "@/contexts/AuthContext";
import { User, UserSearchResult } from "@/types/User.type";
import { tapFeedback } from "@/utilities/haptics";
import { QueryKeys, cancelQueries, restoreQueries, snapshotQueries } from "@/utilities/queryCacheSnapshot";
import { InfiniteData, QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

// Prefixes, not exact keys: the same person can be cached in several search
// results and in more than one follower/following list at once, and every copy
// has to move together.
const USER_FOLLOW_CACHE_KEYS: QueryKeys = [
  ["users", "search"],
  ["users", "followers"],
  ["users", "following"],
];

type ToggleFollowUserVariables = {
  userId: number;
  nextFollowing: boolean;
  // Only for the confirmation toast; the mutation itself doesn't need it.
  displayName?: string;
};

// followersCount is only known for certain once the server answers, so onMutate
// shifts it by +/-1 and onSuccess overwrites it with the authoritative value.
function patchUserFollowed(
  queryClient: QueryClient,
  userId: number,
  following: boolean,
  followersCount?: number
) {
  const resolveCount = (current: number) =>
    followersCount ?? Math.max(0, current + (following ? 1 : -1));

  // The profile cache is keyed by the route param, which is a string.
  queryClient.setQueryData<User>(["users", String(userId)], (old) =>
    old && old.id === userId
      ? { ...old, isFollowed: following, followersCount: resolveCount(old.followersCount) }
      : old
  );

  // Row shape calls the same flag `siguiendo`, mapped from the DTO's isFollowed.
  const shiftRow = (row: UserSearchResult) =>
    row.id === userId
      ? { ...row, siguiendo: following, followersCount: resolveCount(row.followersCount) }
      : row;

  for (const queryKey of USER_FOLLOW_CACHE_KEYS) {
    queryClient.setQueriesData<InfiniteData<UserSearchResult[]>>({ queryKey }, (old) =>
      old ? { ...old, pages: old.pages.map((page) => page.map(shiftRow)) } : old
    );
  }
}

export function useToggleFollowUser() {
  const queryClient = useQueryClient();
  const { currentUser, updateCurrentUser } = useSession();

  return useMutation({
    // One scope for all user-follows rather than one per target: a list can fire
    // several in a row, and serialising them keeps any single pair of taps on the
    // same person from landing out of order.
    scope: { id: 'user-follow' },
    mutationFn: ({ userId, nextFollowing }: ToggleFollowUserVariables) =>
      nextFollowing ? usersService.followUser(userId) : usersService.unfollowUser(userId),
    onMutate: async ({ userId, nextFollowing }) => {
      const keys: QueryKeys = [...USER_FOLLOW_CACHE_KEYS, ["users", String(userId)]];
      await cancelQueries(queryClient, keys);
      const snapshot = snapshotQueries(queryClient, keys);
      // My own "Following" tally lives in AuthContext state, not in the query
      // cache, so it has to be snapshotted and restored separately.
      const previousCurrentUser = currentUser;

      patchUserFollowed(queryClient, userId, nextFollowing);
      if (currentUser) {
        updateCurrentUser({
          ...currentUser,
          followedCount: Math.max(0, currentUser.followedCount + (nextFollowing ? 1 : -1)),
        });
      }
      tapFeedback();

      return { snapshot, previousCurrentUser };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        restoreQueries(queryClient, context.snapshot);
        if (context.previousCurrentUser) updateCurrentUser(context.previousCurrentUser);
      }
      Toast.show({ type: 'error', text1: 'Could not update follow' });
    },
    onSuccess: (result, { userId, displayName }) => {
      // Replace the guessed counts with the server's.
      patchUserFollowed(queryClient, userId, result.isFollowing, result.followersCount);
      if (currentUser) updateCurrentUser({ ...currentUser, followedCount: result.followingCount });
      Toast.show({
        type: 'success',
        text1: result.isFollowing ? 'Following' : "You've unfollowed",
        text2: displayName,
      });
    },
    onSettled: (_data, _error, { userId }) => {
      for (const queryKey of USER_FOLLOW_CACHE_KEYS) queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId)] });
    },
  });
}
