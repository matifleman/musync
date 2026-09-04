import { COLORS } from '@/constants/Colors'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import React from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { AnimatedPressable } from './AnimatedPressable'

type Props = {
  visible: boolean
  onClose: () => void
  onEditProfile: () => void
}

export default function ProfileMenu({ visible, onClose, onEditProfile }: Props) {
  if (!visible) return null

  return (
    <Modal onRequestClose={onClose} animationType="fade" visible={visible} transparent>
      <View style={styles.backdrop} onTouchEnd={onClose} />
      <View style={styles.menu}>
        <AnimatedPressable
          style={styles.menuItem}
          onPress={() => {
            onEditProfile()
            onClose()
          }}
        >
          <MaterialIcons name="edit" size={18} color={COLORS.white} />
          <Text style={styles.menuItemText}>Edit profile</Text>
        </AnimatedPressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },

  menu: {
    position: 'absolute',
    top: 64,
    right: 12,
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 160,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  menuItemText: {
    color: COLORS.white,
    fontSize: 15,
  },
})
