import { AnimatedPressable } from '@/components/AnimatedPressable'
import { COLORS } from '@/constants/Colors'
import { FONTS } from '@/constants/Fonts'
import { useUpdatePostCaption } from '@/hooks/useUpdatePostCaption'
import { Post } from '@/types/Post.type'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { z } from 'zod'

export const CAPTION_MAX_LENGTH = 2200

// No .min(1) — unlike creating a post, clearing the caption is a valid edit and
// the backend stores the blank value as null. The length is checked untrimmed,
// matching the backend validator.
const captionSchema = z.object({
  caption: z.string().max(CAPTION_MAX_LENGTH, `Caption must be ${CAPTION_MAX_LENGTH} characters or fewer`),
})

type CaptionFormData = z.infer<typeof captionSchema>

type Props = {
  visible: boolean
  post: Post
  onClose: () => void
}

export default function EditCaptionModal({ visible, post, onClose }: Props) {
  const updateCaption = useUpdatePostCaption()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CaptionFormData>({
    resolver: zodResolver(captionSchema),
    defaultValues: { caption: post.caption ?? '' },
  })

  // Reseed every time it opens, so a cancelled draft isn't resurrected.
  useEffect(() => {
    if (visible) reset({ caption: post.caption ?? '' })
  }, [visible, post.caption, reset])

  const onSave = (data: CaptionFormData) => {
    updateCaption.mutate(
      { postId: post.id, caption: data.caption },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Caption updated' })
          onClose()
        },
        onError: (error) => {
          console.error('Error updating caption:', error)
          Toast.show({
            type: 'error',
            text1: 'Could not update caption',
            text2: error instanceof Error ? error.message : undefined,
          })
        },
      }
    )
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Edit caption</Text>

          <Controller
            control={control}
            name="caption"
            render={({ field: { onChange, value } }) => (
              // Counter lives in here rather than on a watch() call: the React
              // Compiler skips memoizing any component that uses watch().
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Write your caption..."
                  placeholderTextColor={COLORS.gray}
                  value={value}
                  onChangeText={onChange}
                  maxLength={CAPTION_MAX_LENGTH}
                  multiline
                  numberOfLines={4}
                  autoFocus
                />
                <Text style={styles.counter}>
                  {value.length}/{CAPTION_MAX_LENGTH}
                </Text>
              </>
            )}
          />
          {errors.caption && <Text style={styles.error}>{errors.caption.message}</Text>}

          <View style={styles.actions}>
            <AnimatedPressable
              style={[styles.button, styles.cancel]}
              onPress={updateCaption.isPending ? undefined : onClose}
            >
              <Text style={[styles.buttonText, { color: COLORS.black }]}>Cancel</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[styles.button, styles.save]}
              onPress={updateCaption.isPending ? undefined : handleSubmit(onSave)}
            >
              {updateCaption.isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </AnimatedPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
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
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  counter: {
    color: COLORS.gray,
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  error: {
    color: COLORS.red,
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
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
  save: {
    backgroundColor: COLORS.lightBlueX2,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
    fontSize: 14,
  },
})
