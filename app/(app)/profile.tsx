import PostModal from "@/components/PostModal"
import Stat from "@/components/Stat"
import { COLORS } from '@/constants/Colors'
import { dummyPosts } from '@/data/dummyPosts'
import { Post as PostType } from '@/types/Post.type'
import React, { useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// Importar los posts dummy

const { width } = Dimensions.get('window')
const AVATAR_SIZE = 110
const GRID_SPACING = 2
const GRID_COLUMNS = 3
const GRID_ITEM_SIZE = Math.floor((width - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS)

type User = {
  id: number
  first_name: string
  last_name: string
  username: string
  bio?: string
  profile_picture: ImageSourcePropType
  posts: number
  followers: number
  following: number
}

const user: User = {
  id: 1,
  first_name: 'Matías',
  last_name: 'Fleman',
  username: 'matiasf',
  bio: 'Developer • Cars lover • Buenos Aires 🇦🇷',
  profile_picture: require("@/assets/dummyImages/avatars/avatar0.jpg"),
  posts: 42,
  followers: 1250,
  following: 320,
}

export default function ProfileScreen() {
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const fullName = `${user.first_name} ${user.last_name}`

  const openPost = (post: PostType) => {
    setSelectedPost(post)
    setIsModalVisible(true)
  }

  const closePost = () => {
    setIsModalVisible(false)
    setSelectedPost(null)
  }

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{user.username}</Text>
        </View>

        {/* top block: avatar + stats */}
        <View style={styles.topBlock}>
          <View style={styles.avatarWrapper}>
            <Image source={user.profile_picture} style={styles.avatar} />
          </View>

          <View style={styles.statsContainer}>
            <Stat number={user.posts} label='Publicaciones'/>
            <Stat number={user.followers} label='Seguidores'/>
            <Stat number={user.following} label='Seguidos'/>
          </View>
        </View>

        {/* name, username, bio, buttons */}
        <View style={styles.infoBlock}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* grid of posts */}
        <FlatList
          data={dummyPosts}
          keyExtractor={(item) => String(item.id)}
          numColumns={GRID_COLUMNS}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: GRID_SPACING }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openPost(item)}>
              <Image 
                source={typeof item.img === 'string' ? { uri: item.img } : item.img} 
                style={styles.gridItem} 
              />
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Modal para mostrar el post completo */}
      <PostModal 
        post={selectedPost}
        visible={isModalVisible}
        onClose={closePost}
      />
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  screenContent: {
    paddingBottom: 40,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white
  },
  topBlock: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: AVATAR_SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  username: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  bio: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 2,
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    fontWeight: '600',
    color: COLORS.white,
  },
  moreButton: {
    width: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    fontSize: 20,
    color: COLORS.white,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginBottom: GRID_SPACING,
    backgroundColor: '#ddd',
  },
})