import { COLORS } from '@/constants/Colors';
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
  const [liked, setLiked] = useState(post.liked);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = () => setLiked((liked) => !liked);
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

      <Text style={styles.caption}>
        <Text style={{ fontWeight: '900' }}>
          {post.author.username}{' '}
        </Text>  
        {post.caption}
      </Text>

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
