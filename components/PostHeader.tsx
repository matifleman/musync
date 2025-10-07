import { COLORS } from '@/constants/Colors';
import { Post } from '@/types/Post.type';
import { formatTimestamp } from '@/utilities/dateUtils';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  post: Post;
}

export default function PostHeader({ post }: Props) {
  return (
      <View style={styles.header}>
        <Image
          source={post.author.profile_picture}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.authorName}>
            {post.author.first_name} {post.author.last_name}
          </Text>
          <Text style={styles.datetime}>{formatTimestamp(post.createdAt)}</Text>
        </View>
      </View>
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