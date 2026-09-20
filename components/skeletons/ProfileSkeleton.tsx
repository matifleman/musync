import Skeleton from '@/components/Skeleton';
import { COLORS } from '@/constants/Colors';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

// Same constants the real profile screens compute from, so the grid lines up.
const { width } = Dimensions.get('window');
const AVATAR_SIZE = 110;
const BAND_AVATAR_SIZE = 56;
const GRID_SPACING = 2;
const GRID_COLUMNS = 3;
const GRID_ITEM_SIZE = Math.floor((width - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS);
const GRID_CELLS = 9;
const BAND_AVATARS = 4;

// The posts grid loads separately from the profile itself, so it is exported on
// its own: the own-profile tab has its user immediately and only ever needs this
// half.
export function PostsGridSkeleton() {
  return (
    <View style={styles.postsGrid}>
      {Array.from({ length: GRID_CELLS }, (_, index) => (
        <Skeleton key={index} width={GRID_ITEM_SIZE} height={GRID_ITEM_SIZE} radius={0} />
      ))}
    </View>
  );
}

type Props = {
  // 'other' adds the back arrow and the follow button that only appear when
  // looking at somebody else.
  variant: 'own' | 'other';
};

export default function ProfileSkeleton({ variant }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {variant === 'other' ? <Skeleton width={24} height={24} circle /> : null}
        <Skeleton width={140} height={18} />
        {variant === 'own' ? <Skeleton width={24} height={24} circle /> : null}
      </View>

      <View style={styles.topBlock}>
        <View style={styles.avatarWrapper}>
          <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} circle />
        </View>
        <View style={styles.stats}>
          {Array.from({ length: 3 }, (_, index) => (
            <View key={index} style={styles.stat}>
              <Skeleton width={36} height={18} />
              <Skeleton width={56} height={13} style={styles.statLabel} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoBlock}>
        <Skeleton width={160} height={16} />
        <Skeleton width={100} height={14} style={styles.spaced} />
        <View style={styles.badges}>
          <Skeleton width={70} height={24} radius={12} />
          <Skeleton width={90} height={24} radius={12} />
          <Skeleton width={60} height={24} radius={12} />
        </View>
        {variant === 'other' ? <Skeleton height={36} radius={8} style={styles.spaced} /> : null}
      </View>

      <View style={styles.bandsSection}>
        <Skeleton width={120} height={14} />
        <View style={styles.bandsRow}>
          {Array.from({ length: BAND_AVATARS }, (_, index) => (
            <Skeleton key={index} width={BAND_AVATAR_SIZE} height={BAND_AVATAR_SIZE} circle />
          ))}
        </View>
      </View>

      <PostsGridSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.black },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  topBlock: { flexDirection: 'row', padding: 16 },

  avatarWrapper: { width: AVATAR_SIZE + 12 },

  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },

  stat: { alignItems: 'center' },

  statLabel: { marginTop: 6 },

  infoBlock: { paddingHorizontal: 16, paddingBottom: 8 },

  spaced: { marginTop: 8 },

  badges: { flexDirection: 'row', gap: 8, marginTop: 10 },

  bandsSection: { paddingHorizontal: 16, marginTop: 8 },

  bandsRow: { flexDirection: 'row', gap: 14, marginTop: 10 },

  postsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_SPACING, marginTop: 16 },
});
