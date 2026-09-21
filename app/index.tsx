import { useSession } from '@/contexts/AuthContext'
import { Redirect } from 'expo-router'
import React from 'react'

export default function Index() {
  const { currentUser } = useSession()
  if (!currentUser) return <Redirect href="/sign-in" />
  return <Redirect href={currentUser.onboardingCompleted ? "/(app)" : "/onboarding"} />
}
