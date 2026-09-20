import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {/* AnimatedPressable has no `disabled` prop; dropping onPress is how
                the rest of the app disables it (see FollowButton). */}
            <AnimatedPressable style={[styles.button, styles.cancel]} onPress={loading ? undefined : onCancel}>
              <Text style={[styles.buttonText, { color: COLORS.black }]}>{cancelLabel}</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.button, destructive ? styles.destructive : styles.confirm]}
              onPress={loading ? undefined : onConfirm}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>{confirmLabel}</Text>
              )}
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
    minWidth: 92,
  },
  cancel: {
    backgroundColor: COLORS.white,
  },
  confirm: {
    backgroundColor: COLORS.blue,
  },
  destructive: {
    backgroundColor: COLORS.red,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
    fontSize: 14,
  },
});
