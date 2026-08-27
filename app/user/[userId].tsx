import { AnimatedPressable } from "@/components/AnimatedPressable"
import InstrumentBadges from "@/components/InstrumentBadges"
import PostModal from "@/components/PostModal"
import Stat from "@/components/Stat"
import { COLORS } from "@/constants/Colors"
import { useSession } from "@/contexts/AuthContext"
import { useUserPosts } from "@/hooks/useUserPosts"
import { useUserProfile } from "@/hooks/useUserProfile"
import { searchService } from "@/services/searchService"
import { Post as PostType } from "@/types/Post.type"
import { User } from "@/types/User.type"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useQueryClient } from "@tanstack/react-query"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Toast from "react-native-toast-message"

const { width } = Dimensions.get("window")
const AVATAR_SIZE = 110
const GRID_SPACING = 2
const GRID_COLUMNS = 3
const GRID_ITEM_SIZE = Math.floor((width - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS)

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const { currentUser, updateCurrentUser } = useSession()
  const queryClient = useQueryClient()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null)
  const [isFollowed, setIsFollowed] = useState<boolean>(false)
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)

  const { data: user, isLoading, error, refetch: refetchProfile } = useUserProfile(userId)
  const { data: posts = [], refetch: refetchPosts } = useUserPosts(userId ? Number(userId) : undefined)

  // Seed the local follow toggle from the fetched profile whenever it (re)loads.
  useEffect(() => {
    setIsFollowed(user?.isFollowed ?? false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetchProfile()
        refetchPosts()
      }
    }, [userId, refetchProfile, refetchPosts])
  )

  const handleFollowToggle = async () => {
    if (!currentUser || !user) return;
    try {
      setIsLoadingFollow(true);

      if (isFollowed) {
        await searchService.unfollowUser(parseInt(userId));
        Toast.show({
          type: 'success',
          text1: "You've unfollowed",
          text2: `@${user.userName}`,
        });
        queryClient.setQueryData<User>(['users', userId], (old) =>
          old ? { ...old, followersCount: old.followersCount - 1 } : old
        );
        setIsFollowed(false);
        updateCurrentUser({ ...currentUser, followedCount: currentUser.followedCount - 1 });
      } else {
        await searchService.followUser(parseInt(userId));
        Toast.show({
          type: 'success',
          text1: 'Following',
          text2: `@${user.userName}`,
        })
        queryClient.setQueryData<User>(['users', userId], (old) =>
          old ? { ...old, followersCount: old.followersCount + 1 } : old
        );
        setIsFollowed(true);
        updateCurrentUser({ ...currentUser, followedCount: currentUser.followedCount + 1 });
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo completar la acción',
      })
    } finally {
      setIsLoadingFollow(false);
    }
  }

  const openPost = (post: PostType) => {
    setSelectedPost(post)
    setIsModalVisible(true)
  }

  const closePost = () => {
    setSelectedPost(null)
    setIsModalVisible(false)
  }

  if (isLoading)
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )

  if (error || !user)
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>{error?.message || "Error desconocido"}</Text>
      </View>
    )

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable style={styles.arrowBack} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>{user.userName}</Text>
        </View>

        {/* Avatar + stats */}
        <View style={styles.topBlock}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
          </View>

          <View style={styles.statsContainer}>
            <Stat number={posts.length} label="Posts" />
            <Stat number={user.followersCount} label="Followers" />
            <Stat number={user.followedCount} label="Following" />
          </View>
        </View>

        {/* Info + Follow */}
        <View style={styles.infoBlock}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.username}>@{user.userName}</Text>
          <InstrumentBadges instruments={user.favoriteInstruments ?? []} />

          <View style={styles.actionRow}>
            <TouchableOpacity
              disabled={isLoadingFollow}
              onPress={handleFollowToggle}
              style={[
                styles.followButton,
                isFollowed ? styles.followingButton : styles.followButtonOutline,
              ]}
            >
              {isLoadingFollow ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.followButtonText}>
                  {isFollowed ? "Following" : "Follow"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {
          posts.length === 0 && (
            <View style={[styles.centerContent, {marginTop: 40}]}>
              <Text style={{color: COLORS.white, fontSize: 20}}>{user.userName} hasn&apos;t posted anything yet.</Text>
            </View>
          )
        }

        {/* Posts grid */}
        <View>
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            numColumns={GRID_COLUMNS}
            columnWrapperStyle={{ gap: GRID_SPACING }}
            contentContainerStyle={{ alignItems: "flex-start" }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openPost(item)}>
                <Image
                  source={typeof item.image === "string" ? { uri: item.image } : item.image}
                  style={styles.gridItem}
                />
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <PostModal post={selectedPost} visible={isModalVisible} onClose={closePost} />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContent: {
    paddingBottom: 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  arrowBack: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    marginHorizontal: "auto",
  },
  topBlock: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatarWrapper: {
    width: AVATAR_SIZE + 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  username: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  followButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  followButtonOutline: {
    borderColor: COLORS.lightBlueX2,
  },
  followingButton: {
    backgroundColor: COLORS.lightBlueX2,
    borderColor: COLORS.lightBlueX2,
  },
  followButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginBottom: GRID_SPACING,
    backgroundColor: "#222",
  },
  errorText: {
    color: COLORS.white,
  },
})
