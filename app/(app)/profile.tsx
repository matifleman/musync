import { AnimatedPressable } from "@/components/AnimatedPressable"
import InstrumentBadges from "@/components/InstrumentBadges"
import PostModal from "@/components/PostModal"
import ProfileMenu from "@/components/ProfileMenu"
import Stat from "@/components/Stat"
import UserBandsList from "@/components/UserBandsList"
import { COLORS } from '@/constants/Colors'
import { useSession } from '@/contexts/AuthContext'
import { useUserBands } from "@/hooks/useUserBands"
import { useUserFollowedBandsCount } from "@/hooks/useUserFollowedBandsCount"
import { useUserPosts } from "@/hooks/useUserPosts"
import { usersService } from "@/services/usersService"
import { Post as PostType } from '@/types/Post.type'
import { resolveUserProfilePictureUrl } from "@/utilities/resolverServerImageUrls"
import Entypo from "@expo/vector-icons/Entypo"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { router, useFocusEffect } from "expo-router"
import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'


const { width } = Dimensions.get('window')
const AVATAR_SIZE = 110
const GRID_SPACING = 2
const GRID_COLUMNS = 3
const GRID_ITEM_SIZE = Math.floor((width - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS)

export default function ProfileScreen() {
  const { currentUser, updateCurrentUser } = useSession()
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(false)

  // The profile's own user is always just the session's currentUser — no need
  // for a separate local copy that could drift out of sync with it.
  const user = useMemo(
    () => (currentUser ? resolveUserProfilePictureUrl(currentUser) : null),
    [currentUser]
  )

  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useUserPosts(user?.id)
  const { data: bands = [], refetch: refetchBands } = useUserBands(user?.id)
  const { data: followedBandsCount, refetch: refetchFollowedBandsCount } = useUserFollowedBandsCount(user?.id)

  useFocusEffect(
    useCallback(() => {
      refetchPosts()
      refetchBands()
      refetchFollowedBandsCount()
      // Followers/following counts live on the session's currentUser, which
      // nothing else refreshes on focus — only login/bootstrap or specific
      // mutations (avatar/profile/instruments) update it.
      usersService.getCurrentUser().then(updateCurrentUser).catch((err) => {
        console.error("Error refreshing current user", err)
      })
    }, [refetchPosts, refetchBands, refetchFollowedBandsCount, updateCurrentUser])
  )

  const openPost = (post: PostType) => {
    setSelectedPost(post)
    setIsModalVisible(true)
  }

  const closePost = () => {
    setIsModalVisible(false)
    setSelectedPost(null)
  }

  if (!user) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )
  }

  const fullName = `${user.firstName} ${user.lastName}`
  const postsCount = posts.length

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{user.userName}</Text>
          <AnimatedPressable style={styles.moreButton} onPress={() => setIsMenuVisible(true)}>
            <MaterialIcons name="more-vert" size={24} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
        </View>

        {/* top block: avatar + stats */}
        <View style={styles.topBlock}>
          <View style={styles.avatarWrapper}>
            <Image source={{uri: user.profilePicture}} style={styles.avatar} />
          </View>

          <View style={styles.statsContainer}>
            <AnimatedPressable onPress={() => router.push({ pathname: '/profile/[listType]', params: { listType: 'bands' } })}>
              <Stat number={followedBandsCount?.followedBandsCount ?? 0} label='Bands'/>
            </AnimatedPressable>
            <AnimatedPressable onPress={() => router.push({ pathname: '/profile/[listType]', params: { listType: 'followers' } })}>
              <Stat number={user.followersCount} label='Followers'/>
            </AnimatedPressable>
            <AnimatedPressable onPress={() => router.push({ pathname: '/profile/[listType]', params: { listType: 'following' } })}>
              <Stat number={user.followedCount} label='Following'/>
            </AnimatedPressable>
          </View>
        </View>

        {/* name, username, bio, buttons */}
        <View style={styles.infoBlock}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.username}>@{user.userName}</Text>
          {/* Puedes agregar bio cuando tu backend lo tenga */}
          <InstrumentBadges instruments={user.favoriteInstruments ?? []} />
        </View>

        <UserBandsList bands={bands} />

        {
          !postsLoading && postsCount === 0 && (
            <View style={[styles.centerContent, {marginTop: 40}]}>
              <Text style={{color: COLORS.white, fontSize: 20}}>You haven&apos;t posted anything yet.</Text>
              <AnimatedPressable style={{flexDirection: "row", marginTop: 20, alignItems: "center"}} onPress={() => router.navigate("/(app)/create")}>
                <Text style={{color: COLORS.lightBlueX2, fontSize: 18}}>
                  Create your first post!
                </Text>
                <Entypo style={{marginLeft: 6}} name="chevron-with-circle-right" size={24} color={COLORS.lightBlueX2} />
              </AnimatedPressable>
            </View>
          )
        }

        {/* grid of posts */}
        <View style={styles.postsGrid}>
          {posts.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => openPost(item)}>
              <Image
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                style={styles.gridItem}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal para mostrar el post completo */}
      <PostModal
        post={selectedPost}
        visible={isModalVisible}
        onClose={closePost}
      />

      <ProfileMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onEditProfile={() => router.push('/profile/edit')}
      />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  screenContent: {
    paddingBottom: 40,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white
  },
  moreButton: {
    padding: 4,
  },
  topBlock: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: AVATAR_SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  username: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  bio: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_SPACING,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    backgroundColor: '#ddd',
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: COLORS.black,
    fontWeight: '600',
  },
})
