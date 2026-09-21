import { COLORS } from '@/constants/Colors'
import { useInstruments } from '@/hooks/useInstruments'
import { Instrument } from '@/types/User.type'
import AntDesign from '@expo/vector-icons/AntDesign'
import { BlurView } from 'expo-blur'
import React, { useState } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import InstrumentIcon from './InstrumentIcon'
import { AnimatedPressable } from './AnimatedPressable'
import TagPicker from './TagPicker'

type Props = {
  visible: boolean
  selectedIds: number[]
  maxSelected?: number
  onClose: () => void
  onConfirm: (ids: number[], instruments: Instrument[]) => void
}

export default function SelectInstrumentsModal({ visible, selectedIds: initialSelectedIds, maxSelected, onClose, onConfirm }: Props) {
  // Cached and shared with every other screen that reads this catalogue, instead of refetching
  // on each open.
  const { data: catalog = [], isLoading, isError } = useInstruments()
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

  const handleConfirm = () => {
    onConfirm(selectedIds, catalog.filter((item) => selectedIds.includes(item.id)))
    onClose()
  }

  if (!visible) return null

  return (
    <Modal onRequestClose={onClose} animationType="slide" visible={visible} transparent>
      <BlurView style={styles.blurredOverlay} intensity={20} onTouchEnd={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select instruments</Text>
          <AnimatedPressable onPress={onClose}>
            <AntDesign name="close-circle" size={22} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
        </View>

        <TagPicker
          items={catalog}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          maxSelected={maxSelected}
          loading={isLoading}
          error={isError}
          renderIcon={(instrument) => <InstrumentIcon instrument={instrument} />}
        />

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
