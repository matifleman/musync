import { AnimatedPressable } from "@/components/AnimatedPressable"
import Post from "@/components/Post"
import { COLORS } from "@/constants/Colors"
import { usePost } from "@/hooks/usePost"
import { ApiError } from "@/utilities/api"
import { linkToPost } from "@/utilities/deepLinks"
import { shareLink } from "@/utilities/share"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { router, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"

export default function PostDetailScreen() {
  const { postId: postIdParam } = useLocalSearchParams<{ postId: string }>()
  const postId = Number(postIdParam)

  // Once deleted, the query must not refire and no frame may render the stale
  // post while the screen unwinds.
  const [deleted, setDeleted] = useState(false)
  const { data: post, isLoading, error } = usePost(postId, { enabled: !deleted })

  const handleDeleted = () => {
    setDeleted(true)
    router.back()
  }

  if (deleted) return null

  if (isLoading)
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )

  if (error || !post)
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>
          {error instanceof ApiError && error.status === 404
            ? "This post no longer exists."
            : error?.message || "Could not load this post."}
        </Text>
        <AnimatedPressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </AnimatedPressable>
      </View>
    )

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.header}>
        <AnimatedPressable style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle} numberOfLines={1}>@{post.author.userName}</Text>
        {/* Takes over the spacer that kept the title optically centred */}
        <AnimatedPressable
          style={styles.arrowBack}
          onPress={() => shareLink(linkToPost(post.id), `A post by @${post.author.userName} on Musync`)}
        >
          <MaterialIcons name="share" size={22} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
      </View>

      <Post post={post} onDeleted={handleDeleted} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  screenContent: {
    paddingBottom: 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
    marginBottom: 10,
  },
  arrowBack: {
    width: 32,
    marginLeft: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
})
