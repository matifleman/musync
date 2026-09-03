import { COLORS } from '@/constants/Colors'
import { Genre } from '@/types/Band.type'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  genres: Genre[]
}

export default function GenreBadges({ genres }: Props) {
  if (!genres || genres.length === 0) return null

  return (
    <View style={styles.row}>
      {genres.map((genre) => (
        <View key={genre.id} style={styles.badge}>
          <Text style={styles.badgeText}>{genre.name}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 13,
  },
})
