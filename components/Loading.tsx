import { COLORS } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  message?: string;
};

export default function Loading({ message = 'Loading' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkBlue,
  },
  card: {
    width: '80%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
    fontSize: 16,
  },
});
