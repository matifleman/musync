import { AnimatedPressable } from "@/components/AnimatedPressable"
import { COLORS } from "@/constants/Colors"
import { linkToRelease } from "@/utilities/deepLinks"
import { shareLink } from "@/utilities/share"
import { useRelease } from "@/hooks/useRelease"
import { RELEASE_TYPE_LABELS } from "@/types/Release.type"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { router, useLocalSearchParams } from "expo-router"
import React from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native"

const COVER_SIZE = 220

export default function ReleaseDetailScreen() {
  const { releaseId } = useLocalSearchParams<{ releaseId: string }>()
  const { data: release, isLoading, error } = useRelease(releaseId)

  if (isLoading)
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )

  if (error || !release)
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>{error?.message || "Error desconocido"}</Text>
      </View>
    )

  const songs = [...release.songs].sort((a, b) => a.trackNumber - b.trackNumber)
  const releaseDate = release.createdAt
    ? new Date(release.createdAt).toLocaleDateString()
    : null

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable style={styles.arrowBack} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{release.title}</Text>
        {/* Occupies the spacer that used to sit here purely to centre the title. */}
        <AnimatedPressable
          style={styles.arrowBack}
          onPress={() => shareLink(linkToRelease(release.id), release.title)}
        >
          <MaterialIcons name="share" size={22} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
      </View>

      {/* Cover + info */}
      <View style={styles.topBlock}>
        {release.cover ? (
          <Image source={{ uri: release.cover }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <MaterialIcons name="library-music" size={48} color={COLORS.lightBlueX2} />
          </View>
        )}
        <Text style={styles.title}>{release.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{RELEASE_TYPE_LABELS[release.type]}</Text>
          </View>
          {releaseDate && <Text style={styles.dateText}>{releaseDate}</Text>}
        </View>
      </View>

      {/* Tracklist */}
      <View style={styles.tracklistSection}>
        <Text style={styles.sectionTitle}>Tracklist</Text>
        {songs.map((song) => (
          <View key={song.id} style={styles.trackRow}>
            <Text style={styles.trackNumber}>{song.trackNumber}</Text>
            <Text style={styles.trackTitle}>{song.title}</Text>
          </View>
        ))}
      </View>
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
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
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
  topBlock: {
    alignItems: "center",
    padding: 24,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 8,
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  typeBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#1a1a1a",
  },
  typeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.lightBlueX2,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  tracklistSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gray,
    marginBottom: 8,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222",
    gap: 14,
  },
  trackNumber: {
    fontSize: 14,
    color: COLORS.gray,
    width: 20,
    textAlign: "right",
  },
  trackTitle: {
    fontSize: 15,
    color: COLORS.white,
    flex: 1,
  },
  errorText: {
    color: COLORS.white,
  },
})
