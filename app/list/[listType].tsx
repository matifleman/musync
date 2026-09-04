import { AnimatedPressable } from "@/components/AnimatedPressable"
import FollowButton from "@/components/FollowButton"
import { COLORS } from "@/constants/Colors"
import { useSession } from "@/contexts/AuthContext"
import { useBandFollowers } from "@/hooks/useBandFollowers"
import { useUserFollowedBands } from "@/hooks/useUserFollowedBands"
import { useUserFollowers } from "@/hooks/useUserFollowers"
import { useUserFollowing } from "@/hooks/useUserFollowing"
import { bandsService } from "@/services/bandsService"
import { usersService } from "@/services/usersService"
import { FollowedBandResult } from "@/types/Band.type"
import { UserSearchResult } from "@/types/User.type"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Toast from "react-native-toast-message"

const DEFAULT_AVATAR = require('@/assets/dummyImages/avatars/avatar0.jpg')

type ListType = 'followers' | 'following' | 'bands' | 'band-followers'

const TITLES: Record<ListType, string> = {
  followers: 'Followers',
  following: 'Following',
  bands: 'Bands you follow',
  'band-followers': 'Followers',
}

const EMPTY_MESSAGES: Record<ListType, string> = {
  followers: "No followers yet.",
  following: "Not following anyone yet.",
  bands: "Not following any bands yet.",
  'band-followers': "No followers yet.",
}

export default function ListScreen() {
  const { listType: rawListType, userId, bandId, bandName } = useLocalSearchParams<{
    listType: string
    userId?: string
    bandId?: string
    bandName?: string
  }>()
  const listType = rawListType as ListType
  const { currentUser } = useSession()
  const queryClient = useQueryClient()

  const [processingUserId, setProcessingUserId] = useState<number | null>(null)
  const [processingBandId, setProcessingBandId] = useState<number | null>(null)

  const targetUserId = userId ? Number(userId) : currentUser?.id
  // Only the session user's own Bands/Followers/Following lists are interactive
  // — anyone else's, and a band's followers list, are view-only (no per-item
  // relationship info is available/desired for those).
  const showFollowButton = listType !== 'band-followers' && (!userId || Number(userId) === currentUser?.id)

  const followersQuery = useUserFollowers(listType === 'followers' ? targetUserId : undefined)
  const followingQuery = useUserFollowing(listType === 'following' ? targetUserId : undefined)
  const bandFollowersQuery = useBandFollowers(listType === 'band-followers' ? Number(bandId) : undefined)
  const bandsQuery = useUserFollowedBands(listType === 'bands' ? targetUserId : undefined)

  const isBandsList = listType === 'bands'
  const activeUserQuery = listType === 'followers' ? followersQuery : listType === 'following' ? followingQuery : bandFollowersQuery
  const userItems = !isBandsList ? (activeUserQuery.data?.pages.flat() ?? []) : []
  const bandItems = isBandsList ? (bandsQuery.data?.pages.flat() ?? []) : []

  const isLoading = isBandsList ? bandsQuery.isLoading : activeUserQuery.isLoading
  const hasNextPage = isBandsList ? bandsQuery.hasNextPage : activeUserQuery.hasNextPage
  const isFetchingNextPage = isBandsList ? bandsQuery.isFetchingNextPage : activeUserQuery.isFetchingNextPage
  const fetchNextPage = isBandsList ? bandsQuery.fetchNextPage : activeUserQuery.fetchNextPage

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  const toggleUserFollow = async (item: UserSearchResult) => {
    if (!currentUser || !targetUserId) return
    try {
      setProcessingUserId(item.id)
      const result = item.siguiendo
        ? await usersService.unfollowUser(item.id)
        : await usersService.followUser(item.id)

      Toast.show({
        type: 'success',
        text1: result.isFollowing ? 'Following' : "You've unfollowed",
        text2: `@${item.username}`,
      })

      queryClient.setQueryData<InfiniteData<UserSearchResult[]>>(
        ['users', listType, targetUserId],
        (old) => old ? {
          ...old,
          pages: old.pages.map((page) => page.map((u) =>
            u.id === item.id
              ? { ...u, siguiendo: result.isFollowing, followersCount: result.followersCount }
              : u
          )),
        } : old
      )
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not complete the action' })
    } finally {
      setProcessingUserId(null)
    }
  }

  const toggleBandFollow = async (item: FollowedBandResult) => {
    if (!currentUser || !targetUserId) return
    try {
      setProcessingBandId(item.id)
      const result = item.isFollowing
        ? await bandsService.unfollowBand(item.id)
        : await bandsService.followBand(item.id)

      Toast.show({
        type: 'success',
        text1: result.isFollowing ? 'Following' : "You've unfollowed",
        text2: item.name,
      })

      queryClient.setQueryData<InfiniteData<FollowedBandResult[]>>(
        ['bands', 'user', targetUserId, 'followed'],
        (old) => old ? {
          ...old,
          pages: old.pages.map((page) => page.map((b) =>
            b.id === item.id ? { ...b, isFollowing: result.isFollowing } : b
          )),
        } : old
      )
    } catch (error) {
      console.error('Error following/unfollowing band:', error)
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not complete the action' })
    } finally {
      setProcessingBandId(null)
    }
  }

  const renderUserRow = ({ item }: { item: UserSearchResult }) => (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/user/${item.id}`)}>
      <Image source={item.foto ? { uri: item.foto } : DEFAULT_AVATAR} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.subtitle}>{item.nombre}</Text>
      </View>
      {showFollowButton && (
        <FollowButton
          following={item.siguiendo}
          loading={processingUserId === item.id}
          onPress={() => toggleUserFollow(item)}
        />
      )}
    </TouchableOpacity>
  )

  const renderBandRow = ({ item }: { item: FollowedBandResult }) => (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/band/${item.id}`)}>
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialIcons name="library-music" size={20} color={COLORS.lightBlueX2} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.username}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.memberCount} members</Text>
      </View>
      {showFollowButton && (
        <FollowButton
          following={item.isFollowing}
          loading={processingBandId === item.id}
          onPress={() => toggleBandFollow(item)}
        />
      )}
    </TouchableOpacity>
  )

  const title = listType === 'band-followers'
    ? (bandName ? `Followers of ${bandName}` : TITLES[listType])
    : TITLES[listType]

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <AnimatedPressable style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : isBandsList ? (
        <FlatList
          data={bandItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBandRow}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? (
            <ActivityIndicator size="small" color={COLORS.white} style={styles.footerLoading} />
          ) : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{EMPTY_MESSAGES[listType]}</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={userItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUserRow}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? (
            <ActivityIndicator size="small" color={COLORS.white} style={styles.footerLoading} />
          ) : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{EMPTY_MESSAGES[listType]}</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  arrowBack: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginHorizontal: 'auto',
  },
  listContent: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.lightBlueX2,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  footerLoading: {
    marginVertical: 16,
  },
})
