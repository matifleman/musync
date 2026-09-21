import FollowButton from '@/components/FollowButton'
import { COLORS } from '@/constants/Colors'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import React from 'react'
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native'

export const SUGGESTION_CARD_WIDTH = 140
export const SUGGESTION_AVATAR_SIZE = 64

type Props = {
  // null shows the placeholder glyph - bands often have no picture yet.
  image: ImageSourcePropType | null
  placeholderIcon: React.ComponentProps<typeof MaterialIcons>['name']
  title: string
  subtitle: string
  onPress: () => void
  onFollow: () => void
}

// One card for both people and bands, so the two carousels read as a pair.
// The follow button never shows "Following": a followed suggestion leaves the
// list on tap (see useToggleFollowUser/useToggleFollowBand).
export default function SuggestionCard({ image, placeholderIcon, title, subtitle, onPress, onFollow }: Props) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.body} onPress={onPress}>
        {image ? (
          <Image source={image} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]}>
            <MaterialIcons name={placeholderIcon} size={30} color={COLORS.lightBlueX2} />
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </Pressable>
      <FollowButton following={false} onPress={onFollow} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: SUGGESTION_CARD_WIDTH,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.darkBlue,
    alignItems: 'center',
    gap: 10,
  },

  body: { alignItems: 'center', alignSelf: 'stretch' },

  avatar: {
    width: SUGGESTION_AVATAR_SIZE,
    height: SUGGESTION_AVATAR_SIZE,
    borderRadius: SUGGESTION_AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginBottom: 8,
  },

  // Same fallback look as the band avatars in UserBandsList.
  placeholder: {
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  subtitle: { color: COLORS.gray, fontSize: 12, marginTop: 2 },
})
