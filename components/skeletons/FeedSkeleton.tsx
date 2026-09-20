import Skeleton from '@/components/Skeleton';
import { COLORS } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Dimensions deliberately mirror components/Post.tsx, PostHeader and PostFooter
// so that swapping real posts in doesn't shift the layout by a pixel.
const CARDS = 3;

function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={40} height={40} circle style={styles.avatar} />
        <View>
          <Skeleton width={120} height={15} />
          <Skeleton width={60} height={10} style={styles.datetime} />
        </View>
      </View>

      <Skeleton height={250} radius={0} />

      <View style={styles.footer}>
        <View style={styles.icons}>
          <Skeleton width={24} height={24} circle />
          <Skeleton width={24} height={24} circle />
        </View>
        <Skeleton width="60%" height={14} />
      </View>
    </View>
  );
}

export default function FeedSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: CARDS }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Matches the feed FlatList's contentContainerStyle.
  list: { paddingTop: 10 },

  card: {
    backgroundColor: COLORS.darkBlue,
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden',
  },

  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },

  avatar: { marginRight: 10 },

  datetime: { marginTop: 6 },

  footer: { padding: 12 },

  icons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '26%',
  },
});
