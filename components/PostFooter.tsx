import { COLORS } from '@/constants/Colors';
import { useToggleLike } from '@/hooks/useToggleLike';
import { Post } from '@/types/Post.type';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import CommentsModal from './CommentsModal';

type Props = {
  post: Post;
};

export default function PostFooter({ post }: Props) {
  const [showComments, setShowComments] = useState(false);
  const toggleLike = useToggleLike(post.id);

  // No local mirror of `liked`: the hook patches every cache holding this post,
  // so the prop below is already the optimistic value, and a failed request
  // rolls those caches back. That removes the mount-time-stale-value problem the
  // old useState/useEffect/isToggling trio existed to work around.
  const hideComments = () => setShowComments(false);

  return (
    <View style={styles.footer}>
      {/* Botones Like y Comment */}
      <View style={styles.icons}>
        <AnimatedPressable onPress={() => toggleLike.mutate(!post.liked)}>
          <FontAwesome 
            name={post.liked ? 'heart' : 'heart-o'} 
            size={24} 
            color={COLORS.lightBlueX2}
          />
        </AnimatedPressable>

        <AnimatedPressable style={styles.commentButton} onPress={() => setShowComments(true)}>
          <FontAwesome 
            name="comments-o" 
            size={24} 
            color={COLORS.lightBlueX2} 
          />
          {post.commentsCount > 0 ? (
            <Text style={styles.commentCount}>{post.commentsCount}</Text>
          ) : null}
        </AnimatedPressable>
      </View>

      {post.caption ? (
        <Text style={styles.caption}>
          <Text style={{ fontWeight: '900' }}>
            {post.author.userName}{' '}
          </Text>
          {post.caption}
        </Text>
      ) : null}

      {showComments && (
        <CommentsModal
          isVisible={showComments}
          onClose={hideComments}
          postId={post.id}
          postAuthorId={post.author.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  caption: { 
    fontSize: 14,
    color: COLORS.white,
  },
  
  footer: { padding: 12 },
  
  icons: { 
    flexDirection: 'row',
    justifyContent: "space-between",
    marginBottom: 4, 
    width: "26%",
  },

  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  commentCount: {
    fontSize: 14,
    color: COLORS.lightBlueX2,
  },
});
