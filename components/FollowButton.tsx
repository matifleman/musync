import { COLORS } from '@/constants/Colors'
import React from 'react'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { AnimatedPressable } from './AnimatedPressable'

type Props = {
  following: boolean
  loading?: boolean
  onPress: () => void
}

export default function FollowButton({ following, loading, onPress }: Props) {
  return (
    <AnimatedPressable
      style={following ? [styles.button, styles.buttonFollowing] : styles.button}
      onPress={loading ? undefined : onPress}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.text}>{following ? 'Following' : 'Follow'}</Text>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: COLORS.lightBlueX2,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonFollowing: {
    backgroundColor: COLORS.lightBlueX2,
    borderColor: COLORS.lightBlueX2,
  },

  text: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
})
