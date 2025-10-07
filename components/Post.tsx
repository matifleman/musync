import { COLORS } from "@/constants/Colors";
import { Post as PostType } from "@/types/Post.type";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";

type Props = {
  post: PostType;
};

export default function Post({ post }: Props) {
  return (
    <View style={styles.card}>
      <PostHeader post={post} />

      <Image source={post.img} style={styles.postImage} />

      <PostFooter post={post} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.darkBlue,
    marginBottom: 20,
    borderRadius: 6,
    overflow: "hidden",
  },

  postImage: {
    width: "100%",
    height: 250,
    backgroundColor: COLORS.lightBlue,
  },
});
