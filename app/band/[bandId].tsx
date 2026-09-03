import { AnimatedPressable } from "@/components/AnimatedPressable"
import GenreBadges from "@/components/GenreBadges"
import Stat from "@/components/Stat"
import { COLORS } from "@/constants/Colors"
import { useSession } from "@/contexts/AuthContext"
import { useBandProfile } from "@/hooks/useBandProfile"
import { bandsService } from "@/services/bandsService"
import { Band } from "@/types/Band.type"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useQueryClient } from "@tanstack/react-query"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SvgUri } from "react-native-svg"
import Toast from "react-native-toast-message"

const AVATAR_SIZE = 110

export default function BandProfileScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>()
  const { currentUser } = useSession()
  const queryClient = useQueryClient()

  const [isFollowed, setIsFollowed] = useState<boolean>(false)
  const [isLoadingFollow, setIsLoadingFollow] = useState(false)
  const [joiningInstrumentId, setJoiningInstrumentId] = useState<number | null>(null)
  const [isLeavingBand, setIsLeavingBand] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null)

  const { data: band, isLoading, error, refetch } = useBandProfile(bandId)

  // Seed the local follow toggle from the fetched band whenever it (re)loads.
  useEffect(() => {
    setIsFollowed(band?.isFollowedByCurrentUser ?? false)
  }, [band])

  useFocusEffect(
    useCallback(() => {
      if (bandId) refetch()
    }, [bandId, refetch])
  )

  const handleFollowToggle = async () => {
    if (!currentUser || !band) return
    try {
      setIsLoadingFollow(true)

      const result = isFollowed
        ? await bandsService.unfollowBand(band.id)
        : await bandsService.followBand(band.id)

      Toast.show({
        type: 'success',
        text1: result.isFollowing ? 'Following' : "You've unfollowed",
        text2: band.name,
      })

      // Trust the server-returned counts instead of guessing at +1/-1 locally.
      queryClient.setQueryData<Band>(['bands', bandId], (old) =>
        old ? { ...old, followersCount: result.followersCount, isFollowedByCurrentUser: result.isFollowing } : old
      )
      setIsFollowed(result.isFollowing)
    } catch (error) {
      console.error('Error following/unfollowing band:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not complete the action',
      })
    } finally {
      setIsLoadingFollow(false)
    }
  }

  const handleJoin = async (instrumentId: number, instrumentName: string) => {
    if (!band) return
    try {
      setJoiningInstrumentId(instrumentId)

      const updatedBand = await bandsService.joinBand(band.id, instrumentId)

      Toast.show({
        type: 'success',
        text1: 'Joined the band',
        text2: instrumentName,
      })

      queryClient.setQueryData<Band>(['bands', bandId], updatedBand)
    } catch (error) {
      console.error('Error joining band:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not complete the action',
      })
    } finally {
      setJoiningInstrumentId(null)
    }
  }

  const handleLeave = async () => {
    if (!band) return
    try {
      setIsLeavingBand(true)

      const updatedBand = await bandsService.leaveBand(band.id)

      Toast.show({
        type: 'success',
        text1: "You've left the band",
        text2: band.name,
      })

      queryClient.setQueryData<Band>(['bands', bandId], updatedBand)
    } catch (error) {
      console.error('Error leaving band:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not complete the action',
      })
    } finally {
      setIsLeavingBand(false)
    }
  }

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!band) return
    try {
      setRemovingMemberId(userId)

      const updatedBand = await bandsService.removeMember(band.id, userId)

      Toast.show({
        type: 'success',
        text1: 'Member removed',
        text2: userName,
      })

      queryClient.setQueryData<Band>(['bands', bandId], updatedBand)
    } catch (error) {
      console.error('Error removing member:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not complete the action',
      })
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (isLoading)
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )

  if (error || !band)
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>{error?.message || "Error desconocido"}</Text>
      </View>
    )

  const isMember = band.members.some((m) => m.userId === currentUser?.id)
  const isLeader = band.createdById === currentUser?.id

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>{band.name}</Text>
        {isLeader && (
          <AnimatedPressable style={styles.editButton} onPress={() => router.push(`/band/edit/${band.id}`)}>
            <MaterialIcons name="edit" size={22} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
        )}
      </View>

      {/* Avatar + stats */}
      <View style={styles.topBlock}>
        <View style={styles.avatarWrapper}>
          {band.profilePicture ? (
            <Image source={{ uri: band.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="library-music" size={40} color={COLORS.lightBlueX2} />
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Stat number={band.followersCount} label="Followers" />
        </View>
      </View>

      {/* Info + Follow */}
      <View style={styles.infoBlock}>
        <Text style={styles.name}>{band.name}</Text>
        <GenreBadges genres={band.genres} />

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

          {isMember && (
            <TouchableOpacity
              disabled={isLeavingBand}
              onPress={handleLeave}
              style={styles.leaveButton}
            >
              {isLeavingBand ? (
                <ActivityIndicator color={COLORS.red} size="small" />
              ) : (
                <Text style={styles.leaveButtonText}>Leave band</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lineup */}
      <View style={styles.instrumentsSection}>
        <Text style={styles.sectionTitle}>Lineup</Text>
        {band.requiredInstruments.map((instrument) => {
          const members = band.members.filter((m) => m.instrumentId === instrument.id)
          return (
            <View key={instrument.id} style={styles.instrumentRow}>
              <View style={styles.instrumentInfo}>
                <SvgUri
                  width={20}
                  height={20}
                  uri={`${process.env.EXPO_PUBLIC_SERVER_URL}/${instrument.image}`}
                />
                <Text style={styles.instrumentName}>{instrument.name}</Text>
              </View>
              {members.length > 0 ? (
                isLeader ? (
                  <View style={styles.membersList}>
                    {members.map((m) => (
                      <View key={m.userId} style={styles.memberRow}>
                        <Text style={styles.memberName}>{m.userName}</Text>
                        {m.userId !== currentUser?.id && (
                          <TouchableOpacity
                            disabled={removingMemberId === m.userId}
                            onPress={() => handleRemoveMember(m.userId, m.userName)}
                          >
                            {removingMemberId === m.userId ? (
                              <ActivityIndicator color={COLORS.red} size="small" />
                            ) : (
                              <MaterialIcons name="close" size={16} color={COLORS.red} />
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.memberName}>{members.map((m) => m.userName).join(', ')}</Text>
                )
              ) : !isMember ? (
                <TouchableOpacity
                  disabled={joiningInstrumentId === instrument.id}
                  onPress={() => handleJoin(instrument.id, instrument.name)}
                  style={styles.joinButton}
                >
                  {joiningInstrumentId === instrument.id ? (
                    <ActivityIndicator color={COLORS.lightBlueX2} size="small" />
                  ) : (
                    <Text style={styles.joinButtonText}>Join</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <Text style={styles.vacantText}>Vacant</Text>
              )}
            </View>
          )
        })}
      </View>
    </ScrollView>
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
  editButton: {
    marginRight: 12,
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
    borderColor: COLORS.lightBlueX2,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
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
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
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
  leaveButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  leaveButtonText: {
    color: COLORS.red,
    fontWeight: "600",
  },
  instrumentsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gray,
    marginBottom: 8,
  },
  instrumentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222",
  },
  instrumentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  instrumentName: {
    fontSize: 15,
    color: COLORS.white,
  },
  memberName: {
    fontSize: 14,
    color: COLORS.lightBlueX2,
  },
  membersList: {
    alignItems: "flex-end",
    gap: 6,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vacantText: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: "italic",
  },
  joinButton: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.lightBlueX2,
  },
  joinButtonText: {
    color: COLORS.lightBlueX2,
    fontWeight: "600",
    fontSize: 13,
  },
  errorText: {
    color: COLORS.white,
  },
})
