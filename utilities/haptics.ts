import * as Haptics from 'expo-haptics'

// Haptics are a nicety: they are a no-op on web and can reject on a device with
// no vibrator, and neither case should ever surface as an error to the user.
// Fire-and-forget on purpose - no caller needs to await physical feedback.
export function tapFeedback(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

export function successFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}
