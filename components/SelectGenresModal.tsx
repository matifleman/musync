import { COLORS } from '@/constants/Colors'
import { genresService } from '@/services/genresService'
import { Genre } from '@/types/Band.type'
import AntDesign from '@expo/vector-icons/AntDesign'
import { BlurView } from 'expo-blur'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { AnimatedPressable } from './AnimatedPressable'

type Props = {
  visible: boolean
  selectedIds: number[]
  maxSelected?: number
  onClose: () => void
  onConfirm: (ids: number[], genres: Genre[]) => void
}

export default function SelectGenresModal({ visible, selectedIds: initialSelectedIds, maxSelected, onClose, onConfirm }: Props) {
  const [catalog, setCatalog] = useState<Genre[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds)
  const [prevVisible, setPrevVisible] = useState(visible)

  // Re-seed selection from props each time the modal opens, without
  // setting state synchronously inside an effect.
  if (visible !== prevVisible) {
    setPrevVisible(visible)
    if (visible) {
      setSelectedIds(initialSelectedIds)
    }
  }

  useEffect(() => {
    if (!visible) return

    setLoadingCatalog(true)
    genresService
      .getGenres()
      .then(setCatalog)
      .catch((error) => {
        console.error('Error loading genres:', error)
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not load genres',
        })
      })
      .finally(() => setLoadingCatalog(false))
  }, [visible])

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (maxSelected && prev.length >= maxSelected) return prev
      return [...prev, id]
    })
  }

  const handleConfirm = () => {
    onConfirm(selectedIds, catalog.filter((genre) => selectedIds.includes(genre.id)))
    onClose()
  }

  if (!visible) return null

  return (
    <Modal onRequestClose={onClose} animationType="slide" visible={visible} transparent>
      <BlurView style={styles.blurredOverlay} intensity={20} onTouchEnd={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select genres</Text>
          <AnimatedPressable onPress={onClose}>
            <AntDesign name="close-circle" size={22} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
        </View>

        {loadingCatalog ? (
          <ActivityIndicator size="large" color={COLORS.white} style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={catalog}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item.id)
              return (
                <AnimatedPressable
                  style={isSelected ? [styles.row, styles.rowSelected] : styles.row}
                  onPress={() => toggle(item.id)}
                >
                  <Text style={styles.rowText}>{item.name}</Text>
                </AnimatedPressable>
              )
            }}
          />
        )}

        <AnimatedPressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </AnimatedPressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  blurredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: COLORS.black,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },

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

  confirmButton: {
    backgroundColor: COLORS.lightBlueX2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
})
