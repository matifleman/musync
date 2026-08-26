import { COLORS } from '@/constants/Colors'
import { Instrument } from '@/types/User.type'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SvgUri } from 'react-native-svg'

type Props = {
  instruments: Instrument[]
}

export default function InstrumentBadges({ instruments }: Props) {
  if (!instruments || instruments.length === 0) return null

  return (
    <View style={styles.row}>
      {instruments.map((instrument) => (
        <View key={instrument.id} style={styles.badge}>
          <SvgUri
            width={16}
            height={16}
            uri={`${process.env.EXPO_PUBLIC_SERVER_URL}/${instrument.image}`}
          />
          <Text style={styles.badgeText}>{instrument.name}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
