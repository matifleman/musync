import { useSession } from '@/contexts/AuthContext'
import { Redirect } from 'expo-router'
import React from 'react'

export default function Index() {
  const { currentUser } = useSession()
  return <Redirect href={currentUser ? "/(app)" : "/sign-in"} />
}
