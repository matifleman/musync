import { useSession } from "@/contexts/AuthContext";
import { bandsService } from "@/services/bandsService";
import { Band, FollowedBandResult, FollowedBandsCount } from "@/types/Band.type";
import { tapFeedback } from "@/utilities/haptics";
import { QueryKeys, cancelQueries, restoreQueries, snapshotQueries } from "@/utilities/queryCacheSnapshot";
import { InfiniteData, QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

type ToggleFollowBandVariables = {
  bandId: number;
  nextFollowing: boolean;
  displayName?: string;
};

// Exact keys, never the ['bands','user', id] prefix: the followed-bands list and
// the followed-bands *count* sit side by side under it with completely different
// shapes, and a prefix-matched write would try to walk .pages on the count object.
function bandFollowCacheKeys(bandId: number, currentUserId: number | undefined): QueryKeys {
  const keys: (readonly unknown[])[] = [["bands", String(bandId)]];
  if (currentUserId !== undefined) {
    keys.push(["bands", "user", currentUserId, "followed"]);
    keys.push(["bands", "user", currentUserId, "followed-count"]);
  }
  return keys;
}

function patchBandFollowed(
  queryClient: QueryClient,
  bandId: number,
  currentUserId: number | undefined,
  following: boolean,
  followersCount?: number
) {
  queryClient.setQueryData<Band>(["bands", String(bandId)], (old) =>
    old
      ? {
          ...old,
          isFollowedByCurrentUser: following,
          followersCount: followersCount ?? Math.max(0, old.followersCount + (following ? 1 : -1)),
        }
      : old
  );

  if (currentUserId === undefined) return;

  // Only my own followed list changes; other users' lists are unaffected by me
  // following a band, which is why these are exact keys rather than a prefix.
  queryClient.setQueryData<InfiniteData<FollowedBandResult[]>>(
    ["bands", "user", currentUserId, "followed"],
    (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) =>
              page.map((band) => (band.id === bandId ? { ...band, isFollowing: following } : band))
            ),
          }
        : old
  );

  // Nothing kept this in sync before, so the "Bands" stat could sit stale until
  // a refocus refetch. BandFollowResult carries no authoritative value for it,
  // so it stays a +/-1 guess and is reconciled by the invalidation in onSettled.
  queryClient.setQueryData<FollowedBandsCount>(
    ["bands", "user", currentUserId, "followed-count"],
    (old) =>
      old
        ? { ...old, followedBandsCount: Math.max(0, old.followedBandsCount + (following ? 1 : -1)) }
        : old
  );
}

export function useToggleFollowBand() {
  const queryClient = useQueryClient();
  const { currentUser } = useSession();
  const currentUserId = currentUser?.id;

  return useMutation({
    scope: { id: 'band-follow' },
    mutationFn: ({ bandId, nextFollowing }: ToggleFollowBandVariables) =>
      nextFollowing ? bandsService.followBand(bandId) : bandsService.unfollowBand(bandId),
    onMutate: async ({ bandId, nextFollowing }) => {
      const keys = bandFollowCacheKeys(bandId, currentUserId);
      await cancelQueries(queryClient, keys);
      const snapshot = snapshotQueries(queryClient, keys);

      patchBandFollowed(queryClient, bandId, currentUserId, nextFollowing);
      tapFeedback();

      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context) restoreQueries(queryClient, context.snapshot);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not complete the action' });
    },
    onSuccess: (result, { bandId, displayName }) => {
      patchBandFollowed(queryClient, bandId, currentUserId, result.isFollowing, result.followersCount);
      Toast.show({
        type: 'success',
        text1: result.isFollowing ? 'Following' : "You've unfollowed",
        text2: displayName,
      });
    },
    onSettled: (_data, _error, { bandId }) => {
      for (const queryKey of bandFollowCacheKeys(bandId, currentUserId)) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
