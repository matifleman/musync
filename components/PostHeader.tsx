import { COLORS } from '@/constants/Colors';
import { Post } from '@/types/Post.type';
import { formatTimestamp } from '@/utilities/dateUtils';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  post: Post;
}

export default function PostHeader({ post }: Props) {
  return (
    <AnimatedPressable onPress={()=>router.push(`/user/${post.author.id}`)}>
      <View style={styles.header}>
        <Image
          source={post.author.profilePicture}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.authorName}>
            {post.author.firstName} {post.author.lastName}
          </Text>
          <Text style={styles.datetime}>{formatTimestamp(post.createdAt)}</Text>
        </View>
      </View>
    </AnimatedPressable>
  )
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
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
});