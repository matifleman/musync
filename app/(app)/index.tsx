import { AnimatedPressable } from "@/components/AnimatedPressable";
import Post from "@/components/Post";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { dummyPosts } from "@/data/dummyPosts";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Index() {

  const router = useRouter();

  // const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.appName}>Musync</Text>
        <AnimatedPressable>
          <MaterialIcons name="logout" size={24} color={COLORS.lightBlueX2} onPress={() => router.replace("/sign-in")} />
        </AnimatedPressable>
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