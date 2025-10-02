import React, { useRef } from "react";
import { Animated, Pressable, ViewStyle } from "react-native";

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  style?:   ViewStyle | ViewStyle[];
}

export const AnimatedPressable = ({onPress, children, style}: Props) => {
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(animatedOpacity, {
      toValue: 0.6,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={20}
      style={style}
    >
      <Animated.View style={{ opacity: animatedOpacity }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

