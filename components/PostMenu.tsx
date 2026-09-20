import { COLORS } from '@/constants/Colors'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { BlurView } from 'expo-blur'
import React from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { AnimatedPressable } from './AnimatedPressable'

type Props = {
  visible: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

// A sheet rather than the anchored dropdown ProfileMenu uses: a post can sit
// anywhere in a scrolling feed, so there is no fixed anchor to position against.
export default function PostMenu({ visible, onClose, onEdit, onDelete }: Props) {
  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop} onTouchEnd={onClose} />

      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <View style={styles.sheet}>
          <AnimatedPressable
            style={styles.item}
            onPress={() => {
              onClose()
              onEdit()
            }}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.white} />
            <Text style={styles.itemText}>Edit caption</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.item}
            onPress={() => {
              onClose()
              onDelete()
            }}
          >
            <MaterialIcons name="delete-outline" size={20} color={COLORS.red} />
            <Text style={[styles.itemText, { color: COLORS.red }]}>Delete</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: COLORS.black,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: COLORS.gray,
    paddingTop: 8,
    paddingBottom: 24,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  itemText: {
    color: COLORS.white,
    fontSize: 16,
  },
})
