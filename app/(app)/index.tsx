import { AnimatedPressable } from "@/components/AnimatedPressable";
import ConfirmLogoutModal from '@/components/ConfirmLogoutModal';
import Loading from '@/components/Loading';
import Post from "@/components/Post";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useSession } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Index() {

  const { signOut } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { data: posts = [], isLoading, isFetching, error, refetch } = usePosts();

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
        <ConfirmLogoutModal
          visible={showLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            signOut();
          }}
        />
      </View>
      {isLoading ? (
        <Loading message="Loading posts..." />
      ) : (
        <FlatList
          contentContainerStyle={styles.postsList}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Post post={item} />}
          showsVerticalScrollIndicator={false}
          refreshing={isFetching}
          onRefresh={refetch}
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

  noPostsText: {
    textAlign: "center",
    fontSize: 18,
  },
})
