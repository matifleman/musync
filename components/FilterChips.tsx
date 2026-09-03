import { COLORS } from '@/constants/Colors'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Item = { id: number; name: string }

type Props = {
  label: string
  items: Item[]
  selectedId: number | undefined
  onSelect: (id: number | undefined) => void
}

export default function FilterChips({ label, items, selectedId, onSelect }: Props) {
  if (!items || items.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => {
          const isSelected = selectedId === item.id
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(isSelected ? undefined : item.id)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.gray,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.lightBlueX2,
    borderColor: COLORS.lightBlueX2,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 13,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
})
