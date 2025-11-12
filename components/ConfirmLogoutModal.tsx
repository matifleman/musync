import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmLogoutModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm logout</Text>
          <Text style={styles.message}>Are you sure you want to log out?</Text>

          <View style={styles.actions}>
            <AnimatedPressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={[styles.buttonText, { color: COLORS.black }]}>Cancel</Text>
            </AnimatedPressable>

            <AnimatedPressable style={[styles.button, styles.logout]} onPress={onConfirm}>
              <Text style={styles.buttonText}>Log out</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.darkBlue,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  title: {
    fontFamily: FONTS.jetBrainsMono,
    fontSize: 18,
    color: COLORS.lightBlueX2,
    marginBottom: 8,
  },
  message: {
    color: COLORS.white,
    marginBottom: 16,
    fontFamily: FONTS.spaceMono,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: COLORS.white,
  },
  logout: {
    backgroundColor: COLORS.red,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
    fontSize: 14,
  },
});
