import ThemedText from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <ThemedText fontFamily={FONTS.jetBrainsMono} fontSize={20}>Musync</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: .5,
    borderBottomColor: COLORS.gray,
  }
})