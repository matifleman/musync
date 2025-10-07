import Post from "@/components/Post";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { dummyPosts } from "@/data/dummyPosts";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.appName}>Musync</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.postsList}
        data={dummyPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Post post={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noPostsText}>Start following people to watch posts 🫂</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: .5,
    borderBottomColor: COLORS.gray,
  },

  postsList: {
    paddingTop: 10,
  },

  appName: {
    fontFamily: FONTS.jetBrainsMono,
    fontSize: 20,
    color: COLORS.lightBlueX2,
  },

  noPostsText: {
    textAlign: "center",
    fontSize: 18,
  },
})