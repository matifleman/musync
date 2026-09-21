import Skeleton from '@/components/Skeleton'
import { COLORS } from '@/constants/Colors'
import React from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { SUGGESTION_AVATAR_SIZE, SUGGESTION_CARD_WIDTH } from './SuggestionCard'

const SKELETON_CARDS = 3

type Props<T> = {
  title: string
  items: T[]
  keyOf: (item: T) => string
  renderCard: (item: T) => React.ReactElement
  isLoading: boolean
  isError: boolean
  emptyText: string
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

// A titled, horizontally-paged row. Each carousel pages on its own swipe, which
// is why these aren't sections of one vertical list: a single list has one
// onEndReached and can't page two queries independently.
export default function SuggestionsCarousel<T>({
  title,
  items,
  keyOf,
  renderCard,
  isLoading,
  isError,
  emptyText,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props<T>) {
  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.row}>
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <View key={index} style={styles.skeletonCard}>
              <Skeleton width={SUGGESTION_AVATAR_SIZE} height={SUGGESTION_AVATAR_SIZE} circle />
              <Skeleton width={90} height={14} style={styles.skeletonGap} />
              <Skeleton width={60} height={12} style={styles.skeletonGap} />
              <Skeleton width={100} height={34} radius={6} style={styles.skeletonGap} />
            </View>
          ))}
        </View>
      )
    }

    if (isError) return <Text style={styles.message}>Couldn&apos;t load suggestions</Text>
    if (items.length === 0) return <Text style={styles.message}>{emptyText}</Text>

    return (
      <FlatList
        horizontal
        data={items}
        keyExtractor={keyOf}
        renderItem={({ item }) => renderCard(item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={COLORS.white} />
            </View>
          ) : null
        }
      />
    )
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {renderBody()}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 16 },

  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },

  skeletonCard: {
    width: SUGGESTION_CARD_WIDTH,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.darkBlue,
    alignItems: 'center',
  },

  skeletonGap: { marginTop: 10 },

  footer: { justifyContent: 'center', paddingHorizontal: 12 },

  message: { color: COLORS.gray, fontSize: 14, paddingHorizontal: 16 },
})
