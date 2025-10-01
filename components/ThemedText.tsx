import { COLORS } from '@/constants/Colors';
import { StyleSheet, Text, TextProps } from 'react-native';

type ThemedTextProps = { 
  fontFamily?: string;
  fontSize?  : number; 
} & TextProps;

export default function ThemedText({ style, fontFamily, fontSize, ...props }: ThemedTextProps) {
  return <Text style={[
    styles.base, 
    style,
    { fontFamily, fontSize }
  ]} {...props} />;
};

const styles = StyleSheet.create({
  base: {
    color: COLORS.white,
  },
});