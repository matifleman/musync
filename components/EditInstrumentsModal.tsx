import { COLORS } from '@/constants/Colors'
import { instrumentsService } from '@/services/instrumentsService'
import { Instrument, User } from '@/types/User.type'
import AntDesign from '@expo/vector-icons/AntDesign'
import { BlurView } from 'expo-blur'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, View } from 'react-native'
import { SvgUri } from 'react-native-svg'
import Toast from 'react-native-toast-message'
import { AnimatedPressable } from './AnimatedPressable'

type Props = {
  visible: boolean
  currentInstruments: Instrument[]
  onClose: () => void
  onSaved: (updatedUser: User) => void
}

export default function EditInstrumentsModal({ visible, currentInstruments, onClose, onSaved }: Props) {
  const [catalog, setCatalog] = useState<Instrument[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!visible) return

    setSelectedIds(currentInstruments.map((instrument) => instrument.id))
    setLoadingCatalog(true)
    instrumentsService
      .getInstruments()
      .then(setCatalog)
      .catch((error) => {
        console.error('Error loading instruments:', error)
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Could not load instruments',
        })
      })
      .finally(() => setLoadingCatalog(false))
  }, [visible])

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedUser = await instrumentsService.updateMyInstruments(selectedIds)
      Toast.show({
        type: 'success',
        text1: 'Instruments updated',
      })
      onSaved(updatedUser)
      onClose()
    } catch (error) {
      console.error('Error saving instruments:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Could not save instruments',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!visible) return null

  return (
    <Modal onRequestClose={onClose} animationType="slide" visible={visible} transparent>
      <BlurView style={styles.blurredOverlay} intensity={20} onTouchEnd={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit instruments</Text>
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
                  <SvgUri
                    width={20}
                    height={20}
                    uri={`${process.env.EXPO_PUBLIC_SERVER_URL}/${item.image}`}
                  />
                  <Text style={styles.rowText}>{item.name}</Text>
                </AnimatedPressable>
              )
            }}
          />
        )}

        <AnimatedPressable style={styles.saveButton} onPress={handleSave}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
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

  saveButton: {
    backgroundColor: COLORS.lightBlueX2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
})
