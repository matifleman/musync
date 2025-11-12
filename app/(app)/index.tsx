import { AnimatedPressable } from "@/components/AnimatedPressable";
import ConfirmLogoutModal from '@/components/ConfirmLogoutModal';
import Loading from '@/components/Loading';
import Post from "@/components/Post";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useSession } from "@/contexts/AuthContext";
import { Post as PostType } from "@/types/Post.type";
import { apiFetch } from '@/utilities/api';
import { resolveServerImageUrls } from "@/utilities/resolverServerImageUrls";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Index() {

  const { signOut } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function loadPosts() {
    setLoadingPosts(true);
    setFetchError(null);
    try {
      const res = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const posts: PostType[] = await res.json();
      setPosts(resolveServerImageUrls(posts));
    } catch (err) {
      console.error('Failed loading posts', err);
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setTimeout(() => {
        setLoadingPosts(false);
      }, 500);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.appName}>Musync</Text>
        <AnimatedPressable>
          <MaterialIcons name="logout" size={24} color={COLORS.lightBlueX2} onPress={() => setShowLogoutConfirm(true)} />
        </AnimatedPressable>
        <ConfirmLogoutModal
          visible={showLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            signOut();
          }}
        />
      </View>
      {loadingPosts ? (
        <Loading message="Loading posts..." />
      ) : (
        <FlatList
          contentContainerStyle={styles.postsList}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Post post={item} />}
          showsVerticalScrollIndicator={false}
          refreshing={loadingPosts}
          onRefresh={loadPosts}
          ListEmptyComponent={
            <Text style={styles.noPostsText}>{fetchError ? `Failed to load posts: ${fetchError}` : 'Start following people to watch posts 🫂'}</Text>
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

  noPostsText: {
    textAlign: "center",
    fontSize: 18,
  },
})