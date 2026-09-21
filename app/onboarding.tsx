import { AnimatedPressable } from '@/components/AnimatedPressable'
import SuggestedBands from '@/components/discover/SuggestedBands'
import SuggestedMusicians from '@/components/discover/SuggestedMusicians'
import InstrumentIcon from '@/components/InstrumentIcon'
import TagPicker from '@/components/TagPicker'
import { COLORS } from '@/constants/Colors'
import { MAX_GENRES, MAX_INSTRUMENTS } from '@/constants/Profile'
import { useSession } from '@/contexts/AuthContext'
import { DISCOVER_BANDS_QUERY_KEY } from '@/hooks/useDiscoverBands'
import { DISCOVER_USERS_QUERY_KEY } from '@/hooks/useDiscoverUsers'
import { useGenres } from '@/hooks/useGenres'
import { useInstruments } from '@/hooks/useInstruments'
import { genresService } from '@/services/genresService'
import { instrumentsService } from '@/services/instrumentsService'
import { usersService } from '@/services/usersService'
import { useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'

type Step = 'instruments' | 'genres' | 'follow'

const STEPS: Step[] = ['instruments', 'genres', 'follow']

const COPY: Record<Step, { title: string; subtitle: string }> = {
  instruments: { title: 'What do you play?', subtitle: `Pick up to ${MAX_INSTRUMENTS}. You can change this later.` },
  genres: { title: 'What do you listen to?', subtitle: `Pick up to ${MAX_GENRES}. Suggestions are ranked on these.` },
  follow: { title: 'Follow some musicians', subtitle: 'People and bands who share your taste. Follow any you like.' },
}

// A one-time flow between sign-up and the app: instruments -> genres -> follow suggestions.
// Every step can be skipped. Each step saves on Next, so leaving halfway keeps what was picked,
// and by the follow step the suggestions are already ranked on the tags just chosen.
// Reaching the end - by Done or by Skip - marks the account onboarded, and the gate in
// app/_layout.tsx then swaps this screen for the app.
export default function OnboardingScreen() {
  const { currentUser, updateCurrentUser } = useSession()
  const queryClient = useQueryClient()
  const instruments = useInstruments()
  const genres = useGenres()

  const [step, setStep] = useState<Step>('instruments')
  const [saving, setSaving] = useState(false)
  // Seeded from the account, so returning to an unfinished flow shows what was already saved.
  const [instrumentIds, setInstrumentIds] = useState<number[]>(
    () => currentUser?.favoriteInstruments.map((i) => i.id) ?? []
  )
  const [genreIds, setGenreIds] = useState<number[]>(() => currentUser?.favoriteGenres.map((g) => g.id) ?? [])

  const stepIndex = STEPS.indexOf(step)

  const fail = (what: string, error: unknown) =>
    Toast.show({ type: 'error', text1: `Could not ${what}`, text2: error instanceof Error ? error.message : undefined })

  const finish = async () => {
    setSaving(true)
    try {
      // The response is the full user with the flag set; storing it is what flips the gate.
      updateCurrentUser(await usersService.completeOnboarding())
    } catch (error) {
      // Stay on the last step so Done can be retried.
      fail('finish setting up your account', error)
      setSaving(false)
    }
  }

  const saveAndAdvance = async () => {
    setSaving(true)
    try {
      if (step === 'instruments' && instrumentIds.length > 0) {
        updateCurrentUser(await instrumentsService.updateMyInstruments(instrumentIds))
        // Instruments feed only the people ranking.
        queryClient.invalidateQueries({ queryKey: DISCOVER_USERS_QUERY_KEY })
      }
      if (step === 'genres' && genreIds.length > 0) {
        updateCurrentUser(await genresService.updateMyGenres(genreIds))
        queryClient.invalidateQueries({ queryKey: DISCOVER_USERS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: DISCOVER_BANDS_QUERY_KEY })
      }
      setStep(STEPS[stepIndex + 1])
    } catch (error) {
      fail(step === 'instruments' ? 'save your instruments' : 'save your genres', error)
    } finally {
      setSaving(false)
    }
  }

  const skip = () => (step === 'follow' ? finish() : setStep(STEPS[stepIndex + 1]))

  const renderStep = () => {
    if (step === 'instruments') {
      return (
        <TagPicker
          items={instruments.data ?? []}
          selectedIds={instrumentIds}
          onChange={setInstrumentIds}
          maxSelected={MAX_INSTRUMENTS}
          loading={instruments.isLoading}
          error={instruments.isError}
          renderIcon={(instrument) => <InstrumentIcon instrument={instrument} />}
        />
      )
    }
    if (step === 'genres') {
      return (
        <TagPicker
          items={genres.data ?? []}
          selectedIds={genreIds}
          onChange={setGenreIds}
          maxSelected={MAX_GENRES}
          loading={genres.isLoading}
          error={genres.isError}
        />
      )
    }
    // The same self-contained carousels as the Search tab.
    return (
      <ScrollView contentContainerStyle={styles.follow}>
        <SuggestedMusicians />
        <SuggestedBands />
      </ScrollView>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.progress}>
          {STEPS.map((s, index) => (
            <View key={s} style={[styles.dot, index <= stepIndex && styles.dotActive]} />
          ))}
        </View>
        <AnimatedPressable onPress={saving ? undefined : skip}>
          <Text style={styles.skip}>Skip</Text>
        </AnimatedPressable>
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>{COPY[step].title}</Text>
        <Text style={styles.subtitle}>{COPY[step].subtitle}</Text>
      </View>

      <View style={styles.body}>{renderStep()}</View>

      <AnimatedPressable
        style={styles.primaryButton}
        onPress={saving ? undefined : step === 'follow' ? finish : saveAndAdvance}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.primaryButtonText}>{step === 'follow' ? 'Done' : 'Next'}</Text>
        )}
      </AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.black, paddingBottom: 16 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  progress: { flexDirection: 'row', gap: 6 },

  dot: { width: 28, height: 4, borderRadius: 2, backgroundColor: COLORS.darkBlue },

  dotActive: { backgroundColor: COLORS.lightBlueX2 },

  skip: { color: COLORS.gray, fontSize: 15 },

  heading: { paddingHorizontal: 16, marginBottom: 16 },

  title: { color: COLORS.white, fontSize: 24, fontWeight: '700' },

  subtitle: { color: COLORS.gray, fontSize: 14, marginTop: 6 },

  body: { flex: 1, paddingHorizontal: 16 },

  // The carousels bring their own horizontal padding.
  follow: { marginHorizontal: -16, paddingBottom: 16 },

  primaryButton: {
    backgroundColor: COLORS.lightBlueX2,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
  },

  primaryButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
})
