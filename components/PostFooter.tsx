import { COLORS } from '@/constants/Colors';
import { postsService } from '@/services/postsService';
import { Post } from '@/types/Post.type';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useRef, useState } from 'react';
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
  const [liked, setLiked] = useState(post.liked);
  const [showComments, setShowComments] = useState(false);
  const isToggling = useRef(false);

  // The feed is refetched on focus and after every edit/delete, so the local
  // toggle has to follow the server's value instead of staying frozen at the
  // one it mounted with. Skipped mid-request so an in-flight toggle isn't
  // clobbered by a refetch that hasn't seen it yet.
  useEffect(() => {
    if (!isToggling.current) setLiked(post.liked);
  }, [post.liked]);

  const toggleLike = () => {
    const next = !liked;
    isToggling.current = true;
    setLiked(next);

    const request = next ? postsService.likePost(post.id) : postsService.unlikePost(post.id);
    request
      .catch((error) => {
        console.error('Error toggling like:', error);
        setLiked(!next);
      })
      .finally(() => {
        isToggling.current = false;
      });
  }
  const hideComments = () => setShowComments(false);

  return (
    <View style={styles.footer}>
      {/* Botones Like y Comment */}
      <View style={styles.icons}>
        <AnimatedPressable onPress={toggleLike}>
          <FontAwesome 
            name={liked ? 'heart' : 'heart-o'} 
            size={24} 
            color={COLORS.lightBlueX2}
          />
        </AnimatedPressable>

        <AnimatedPressable onPress={() => setShowComments(true)}>
          <FontAwesome 
            name="comments-o" 
            size={24} 
            color={COLORS.lightBlueX2} 
          />
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

      <CommentsModal isVisible={showComments} onClose={hideComments} />
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
});
