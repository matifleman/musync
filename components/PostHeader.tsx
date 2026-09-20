import { COLORS } from '@/constants/Colors';
import { useSession } from '@/contexts/AuthContext';
import { useDeletePost } from '@/hooks/useDeletePost';
import { Post } from '@/types/Post.type';
import { formatTimestamp } from '@/utilities/dateUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AnimatedPressable } from './AnimatedPressable';
import ConfirmModal from './ConfirmModal';
import EditCaptionModal from './EditCaptionModal';
import PostMenu from './PostMenu';

type Props = {
  post: Post;
  // Let a screen whose whole content is this post (the detail route) react to
  // its deletion; the feed and the grids just let the cache update drop it.
  onDeleted?: () => void;
}

export default function PostHeader({ post, onDeleted }: Props) {
  const { currentUser } = useSession();
  const isOwner = !!currentUser && currentUser.id === post.author.id;

  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const deletePost = useDeletePost();

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => {
        setConfirmVisible(false);
        Toast.show({ type: 'success', text1: 'Post deleted' });
        onDeleted?.();
      },
      onError: (error) => {
        console.error('Error deleting post:', error);
        setConfirmVisible(false);
        Toast.show({
          type: 'error',
          text1: 'Could not delete post',
          text2: error instanceof Error ? error.message : undefined,
        });
      },
    });
  };

  return (
    // The author block and the "⋯" are siblings, never nested: AnimatedPressable
    // fires on onTouchEnd, which bubbles, so a nested button would also navigate
    // to the author's profile.
    <View style={styles.header}>
      <AnimatedPressable style={styles.authorRow} onPress={() => router.push(`/user/${post.author.id}`)}>
        <Image
          source={post.author.profilePicture}
          style={styles.avatar}
        />
        <View style={styles.authorText}>
          <Text style={styles.authorName} numberOfLines={1}>
            {post.author.firstName} {post.author.lastName}
          </Text>
          <Text style={styles.datetime}>{formatTimestamp(post.createdAt)}</Text>
        </View>
      </AnimatedPressable>

      {isOwner && (
        <AnimatedPressable style={styles.moreButton} onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="more-horiz" size={22} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
      )}

      {/* Mounted only while open: a 20-post feed would otherwise instantiate
          three Modals per row. */}
      {menuVisible && (
        <PostMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onEdit={() => setEditVisible(true)}
          onDelete={() => setConfirmVisible(true)}
        />
      )}

      {editVisible && (
        <EditCaptionModal visible={editVisible} post={post} onClose={() => setEditVisible(false)} />
      )}

      {confirmVisible && (
        <ConfirmModal
          visible={confirmVisible}
          title="Delete post"
          message="This post and its image will be removed permanently. This can't be undone."
          confirmLabel="Delete"
          loading={deletePost.isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmVisible(false)}
        />
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorText: {
    flexShrink: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontWeight: "600",
    fontSize: 15,
    color: COLORS.white,
  },

  datetime: {
    fontSize: 10,
    color: COLORS.gray,
  },

  moreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
