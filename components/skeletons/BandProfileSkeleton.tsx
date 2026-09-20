import Skeleton from '@/components/Skeleton';
import { COLORS } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const AVATAR_SIZE = 110;
const RELEASE_COVER_SIZE = 56;
const RELEASE_ROWS = 2;
const LINEUP_ROWS = 3;

// Mirrors app/band/[bandId].tsx: one stat rather than three, and the release and
// lineup sections underneath.
export default function BandProfileSkeleton() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Skeleton width={24} height={24} circle />
        <Skeleton width={140} height={18} />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.topBlock}>
        <View style={styles.avatarWrapper}>
          <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} circle />
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Skeleton width={36} height={18} />
            <Skeleton width={64} height={13} style={styles.statLabel} />
          </View>
        </View>
      </View>

      <View style={styles.infoBlock}>
        <Skeleton width={180} height={16} />
        <View style={styles.badges}>
          <Skeleton width={70} height={24} radius={12} />
          <Skeleton width={90} height={24} radius={12} />
        </View>
        <View style={styles.actionRow}>
          <Skeleton width={120} height={36} radius={8} />
          <Skeleton width={110} height={36} radius={8} />
        </View>
      </View>

      <View style={styles.section}>
        <Skeleton width={100} height={14} />
        {Array.from({ length: RELEASE_ROWS }, (_, index) => (
          <View key={index} style={styles.releaseRow}>
            <Skeleton width={RELEASE_COVER_SIZE} height={RELEASE_COVER_SIZE} radius={6} />
            <View style={styles.releaseInfo}>
              <Skeleton width={150} height={15} />
              <Skeleton width={50} height={11} style={styles.releaseBadge} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Skeleton width={80} height={14} />
        {Array.from({ length: LINEUP_ROWS }, (_, index) => (
          <View key={index} style={styles.lineupRow}>
            <View style={styles.lineupLeft}>
              <Skeleton width={20} height={20} circle />
              <Skeleton width={110} height={15} />
            </View>
            <Skeleton width={70} height={15} />
          </View>
        ))}
      </View>
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

  // Keeps the title optically centred, as the real header's spacer does.
  headerSpacer: { width: 24 },

  topBlock: { flexDirection: 'row', padding: 16 },

  avatarWrapper: { width: AVATAR_SIZE + 12 },

  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },

  stat: { alignItems: 'center' },

  statLabel: { marginTop: 6 },

  infoBlock: { paddingHorizontal: 16, paddingBottom: 8 },

  badges: { flexDirection: 'row', gap: 8, marginTop: 10 },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },

  section: { paddingHorizontal: 16, marginTop: 16 },

  releaseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },

  releaseInfo: { flex: 1 },

  releaseBadge: { marginTop: 6 },

  lineupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  lineupLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
