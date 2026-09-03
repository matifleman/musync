import { COLORS } from '@/constants/Colors'
import { UserBand } from '@/types/Band.type'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router } from 'expo-router'
import React from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const BAND_AVATAR_SIZE = 56

type Props = {
  bands: UserBand[]
}

export default function UserBandsList({ bands }: Props) {
  if (!bands || bands.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bands</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {bands.map((band) => (
          <TouchableOpacity key={band.id} style={styles.item} onPress={() => router.push(`/band/${band.id}`)}>
            <View style={styles.avatarWrapper}>
              {band.profilePicture ? (
                <Image source={{ uri: band.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="library-music" size={22} color={COLORS.lightBlueX2} />
                </View>
              )}
              {band.isLeader && (
                <View style={styles.leaderBadge}>
                  <MaterialIcons name="star" size={12} color={COLORS.black} />
                </View>
              )}
            </View>
            <Text style={styles.name} numberOfLines={1}>{band.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    paddingHorizontal: 16,
    gap: 14,
  },
  item: {
    width: BAND_AVATAR_SIZE + 8,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: BAND_AVATAR_SIZE,
    height: BAND_AVATAR_SIZE,
    borderRadius: BAND_AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.lightBlueX2,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.lightBlueX2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.black,
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.white,
    textAlign: 'center',
  },
})
