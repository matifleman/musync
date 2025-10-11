import { COLORS } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
    number: number;
    label:  string;
}

export default function Stat({number, label}: Props ) {

  return (
    <View style={styles.statItem}>
        <Text style={styles.statNumber}>{number}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.gray,
    },
})