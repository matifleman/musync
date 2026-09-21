import { COLORS } from '@/constants/Colors'
import React from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { AnimatedPressable } from './AnimatedPressable'

type Tag = { id: number; name: string }

type Props<T extends Tag> = {
  items: T[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
  maxSelected?: number
  loading?: boolean
  error?: boolean
  // Instruments show their icon; genres have none.
  renderIcon?: (item: T) => React.ReactNode
}

// The selectable list behind both catalogue pickers - the instrument and genre modals on the
// edit-profile screen, and the first two onboarding steps. Controlled: the caller owns the
// selection, so a modal can hold it until Confirm while onboarding saves it on Next.
export default function TagPicker<T extends Tag>({
  items,
  selectedIds,
  onChange,
  maxSelected,
  loading,
  error,
  renderIcon,
}: Props<T>) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) return onChange(selectedIds.filter((x) => x !== id))
    if (maxSelected && selectedIds.length >= maxSelected) return
    onChange([...selectedIds, id])
  }

  if (loading) return <ActivityIndicator size="large" color={COLORS.white} style={styles.state} />
  if (error) return <Text style={styles.message}>Couldn&apos;t load the list. Try again later.</Text>

  return (
    <View style={styles.list}>
      {maxSelected ? (
        <Text style={styles.counter}>{selectedIds.length}/{maxSelected} selected</Text>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id)
          return (
            <AnimatedPressable
              style={isSelected ? [styles.row, styles.rowSelected] : styles.row}
              onPress={() => toggle(item.id)}
            >
              {renderIcon ? renderIcon(item) : null}
              <Text style={styles.rowText}>{item.name}</Text>
            </AnimatedPressable>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  list: { flexShrink: 1 },

  state: { marginVertical: 20 },

  message: { color: COLORS.gray, fontSize: 14, textAlign: 'center', marginVertical: 20 },

  counter: { color: COLORS.gray, fontSize: 13, marginBottom: 8, paddingHorizontal: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  rowSelected: {
    backgroundColor: COLORS.lightBlueX2,
    borderColor: COLORS.lightBlueX2,
  },

  rowText: {
    color: COLORS.white,
    fontSize: 15,
  },
})
