import { AnimatedPressable } from "@/components/AnimatedPressable";
import ConfirmModal from '@/components/ConfirmModal';
import FeedSkeleton from '@/components/skeletons/FeedSkeleton';
import Post from "@/components/Post";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useSession } from "@/contexts/AuthContext";
import { FEED_QUERY_KEY, usePosts } from "@/hooks/usePosts";
import { Post as PostType } from "@/types/Post.type";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

export default function Index() {

  const { signOut } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  // Offset paging can return the same post twice if someone posts while the
  // user is scrolling, so keep only the first occurrence of each id.
  const posts = useMemo(() => {
    const seen = new Set<number>();
    return (data?.pages.flat() ?? []).filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [data]);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  // Drop every page but the first before refetching, so pull-to-refresh goes
  // back to page 1 while the current list stays on screen.
  const handleRefresh = () => {
    queryClient.setQueryData<InfiniteData<PostType[]>>(FEED_QUERY_KEY, (old) =>
      old ? { pages: old.pages.slice(0, 1), pageParams: old.pageParams.slice(0, 1) } : old
    );
    refetch();
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.appName}>Musync</Text>
        <AnimatedPressable>
          <MaterialIcons name="logout" size={24} color={COLORS.lightBlueX2} onPress={() => setShowLogoutConfirm(true)} />
        </AnimatedPressable>
        <ConfirmModal
          visible={showLogoutConfirm}
          title="Confirm logout"
          message="Are you sure you want to log out?"
          confirmLabel="Log out"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            signOut();
          }}
        />
      </View>
      {isLoading ? (
        <FeedSkeleton />
      ) : (
        <FlatList
          contentContainerStyle={styles.postsList}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Post post={item} />}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? (
            <ActivityIndicator size="small" color={COLORS.white} style={styles.footerLoading} />
          ) : null}
          ListEmptyComponent={
            <Text style={styles.noPostsText}>{error ? `Failed to load posts: ${error.message}` : 'Start following people to watch posts 🫂'}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: .5,
    borderBottomColor: COLORS.gray,
  },

  postsList: {
    paddingTop: 10,
  },

  appName: {
    fontFamily: FONTS.jetBrainsMono,
    fontSize: 20,
    color: COLORS.lightBlueX2,
  },

  footerLoading: {
    marginVertical: 16,
  },

  noPostsText: {
    textAlign: "center",
    fontSize: 18,
  },
})
