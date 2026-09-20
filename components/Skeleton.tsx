import { COLORS } from '@/constants/Colors';
import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

type Props = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  // Convenience for avatars: derives the radius from the height.
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PULSE_FROM = 0.35;
const PULSE_TO = 1;
const PULSE_DURATION = 900;

// A placeholder block that breathes, so a loading screen reads as "filling in"
// rather than frozen. Reanimated drives the opacity off the JS thread, which
// matters because the feed skeleton animates a dozen of these at once.
export default function Skeleton({ width = '100%', height, radius = 4, circle, style }: Props) {
  const opacity = useSharedValue(PULSE_FROM);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(PULSE_TO, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: circle ? height / 2 : radius,
          backgroundColor: COLORS.blue,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
