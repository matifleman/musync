import { AnimatedPressable } from "@/components/AnimatedPressable"
import GenreBadges from "@/components/GenreBadges"
import InstrumentBadges from "@/components/InstrumentBadges"
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton"
import { linkToUser } from "@/utilities/deepLinks"
import { shareLink } from "@/utilities/share"
import Stat from "@/components/Stat"
import UserBandsList from "@/components/UserBandsList"
import { COLORS } from "@/constants/Colors"
import { useSession } from "@/contexts/AuthContext"
import { useUserBands } from "@/hooks/useUserBands"
import { useUserFollowedBandsCount } from "@/hooks/useUserFollowedBandsCount"
import { useUserPosts } from "@/hooks/useUserPosts"
import { useToggleFollowUser } from "@/hooks/useToggleFollowUser"
import { useUserProfile } from "@/hooks/useUserProfile"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback } from "react"
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")
const AVATAR_SIZE = 110
const GRID_SPACING = 2
const GRID_COLUMNS = 3
const GRID_ITEM_SIZE = Math.floor((width - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS)

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const { currentUser } = useSession()
  const toggleFollow = useToggleFollowUser()

  const { data: user, isLoading, error, refetch: refetchProfile } = useUserProfile(userId)
  const { data: posts = [], refetch: refetchPosts } = useUserPosts(userId ? Number(userId) : undefined)
  const { data: bands = [], refetch: refetchBands } = useUserBands(userId ? Number(userId) : undefined)
  const { data: followedBandsCount, refetch: refetchFollowedBandsCount } = useUserFollowedBandsCount(userId ? Number(userId) : undefined)

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetchProfile()
        refetchPosts()
        refetchBands()
        refetchFollowedBandsCount()
      }
    }, [userId, refetchProfile, refetchPosts, refetchBands, refetchFollowedBandsCount])
  )

  // The button reads straight from the cached profile; useToggleFollowUser
  // patches it (and every list this person appears in) on tap and rolls all of
  // them back if the request fails.
  const handleFollowToggle = () => {
    if (!currentUser || !user) return;
    toggleFollow.mutate({
      userId: user.id,
      nextFollowing: !user.isFollowed,
      displayName: `@${user.userName}`,
    });
  }

  if (isLoading) return <ProfileSkeleton variant="other" />

  if (error || !user)
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>{error?.message || "Error desconocido"}</Text>
      </View>
    )

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>{user.userName}</Text>
        <AnimatedPressable
          style={styles.headerAction}
          onPress={() => shareLink(linkToUser(user.id), `Check out @${user.userName} on Musync`)}
        >
          <MaterialIcons name="share" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
      </View>

      {/* Avatar + stats */}
      <View style={styles.topBlock}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        </View>

        <View style={styles.statsContainer}>
          <AnimatedPressable onPress={() => router.push({ pathname: '/list/[listType]', params: { listType: 'bands', userId } })}>
            <Stat number={followedBandsCount?.followedBandsCount ?? 0} label="Bands" />
          </AnimatedPressable>
          <AnimatedPressable onPress={() => router.push({ pathname: '/list/[listType]', params: { listType: 'followers', userId } })}>
            <Stat number={user.followersCount} label="Followers" />
          </AnimatedPressable>
          <AnimatedPressable onPress={() => router.push({ pathname: '/list/[listType]', params: { listType: 'following', userId } })}>
            <Stat number={user.followedCount} label="Following" />
          </AnimatedPressable>
        </View>
      </View>

      {/* Info + Follow */}
      <View style={styles.infoBlock}>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.username}>@{user.userName}</Text>
        <InstrumentBadges instruments={user.favoriteInstruments ?? []} />
        <GenreBadges genres={user.favoriteGenres ?? []} />

        <View style={styles.actionRow}>
          {/* No pending spinner any more: the label flips on tap and reverts if
              the request fails, so a spinner would only ever flash. */}
          <TouchableOpacity
            onPress={handleFollowToggle}
            style={[
              styles.followButton,
              user.isFollowed ? styles.followingButton : styles.followButtonOutline,
            ]}
          >
            <Text style={styles.followButtonText}>
              {user.isFollowed ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <UserBandsList bands={bands} />

      {
        posts.length === 0 && (
          <View style={[styles.centerContent, {marginTop: 40}]}>
            <Text style={{color: COLORS.white, fontSize: 20}}>{user.userName} hasn&apos;t posted anything yet.</Text>
          </View>
        )
      }

      {/* Posts grid */}
      <View style={styles.postsGrid}>
        {posts.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push({ pathname: "/post/[postId]", params: { postId: item.id } })}
          >
            <Image source={{ uri: item.image }} style={styles.gridItem} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  // Mirrors arrowBack's footprint so headerTitle's auto margins keep the title
  // centred now that there is something on both sides of it.
  headerAction: {
    marginRight: 8,
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
  postsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_SPACING,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    backgroundColor: "#222",
  },
  errorText: {
    color: COLORS.white,
  },
})
