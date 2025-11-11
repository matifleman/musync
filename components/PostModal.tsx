import Post from "@/components/Post"
import { COLORS } from '@/constants/Colors'
import { Post as PostType } from '@/types/Post.type'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import React from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

type Props = {
  post: PostType | null
  visible: boolean
  onClose: () => void
}

export default function PostModal({ post, visible, onClose }: Props) {
  if (!post) return null

  console.log("PostModal rendering with post:", post);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Botón de cerrar */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={24} color={COLORS.white} />
          </Pressable>

          {/* Post completo */}
          <ScrollView contentContainerStyle={{ justifyContent: 'center', flex: 1, }}>
            <Post post={post} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    // alignItems: 'center', 
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    // justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
})