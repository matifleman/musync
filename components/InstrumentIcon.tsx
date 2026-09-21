import { Instrument } from '@/types/User.type'
import React from 'react'
import { SvgUri } from 'react-native-svg'

// The server hosts each instrument's icon as an SVG; its path comes back relative.
export default function InstrumentIcon({ instrument, size = 20 }: { instrument: Instrument; size?: number }) {
  return (
    <SvgUri
      width={size}
      height={size}
      uri={`${process.env.EXPO_PUBLIC_SERVER_URL}/${instrument.image}`}
    />
  )
}
