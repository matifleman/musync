import PostModal from "@/components/PostModal"
import Stat from "@/components/Stat"
import { COLORS } from '@/constants/Colors'
import { useSession } from '@/contexts/AuthContext'
import { dummyPosts } from '@/data/dummyPosts'
import { Post as PostType } from '@/types/Post.type'
import { User } from '@/types/User.type'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
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

const { width } = Dimensions.get('window')
const AVATAR_SIZE = 110
const GRID_SPACING = 2
const GRID_COLUMNS = 3
const GRID_ITEM_SIZE = Math.floor((width - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS)

const DEFAULT_AVATAR = require("@/assets/dummyImages/avatars/avatar0.jpg")

export default function ProfileScreen() {
  const { session } = useSession()
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [session])

  const loadUserData = () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!session) {
        setError('No hay sesión activa')
        return
      }
      
      // Parse el session que contiene toda la info del usuario
      const sessionObj = JSON.parse(session)
      const userData = sessionObj.user
      
      // Mapear los datos del contexto a tu tipo User
      setUser(userData)
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('No se pudo cargar la información del perfil')
    } finally {
      setLoading(false)
    }
  }

  const openPost = (post: PostType) => {
    setSelectedPost(post)
    setIsModalVisible(true)
  }

  const closePost = () => {
    setIsModalVisible(false)
    setSelectedPost(null)
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    )
  }

  if (error || !user) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Error desconocido'}</Text>
        <TouchableOpacity onPress={loadUserData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const fullName = `${user.firstName} ${user.lastName}`
  const avatarSource: ImageSourcePropType = user.profilePicture 
    ? { uri: user.profilePicture } 
    : DEFAULT_AVATAR

  // Usar dummyPosts.length ya que el backend aún no tiene posts
  const postsCount = dummyPosts.length

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{user.userName}</Text>
        </View>

        {/* top block: avatar + stats */}
        <View style={styles.topBlock}>
          <View style={styles.avatarWrapper}>
            <Image source={avatarSource} style={styles.avatar} />
          </View>

          <View style={styles.statsContainer}>
            <Stat number={postsCount} label='Publicaciones'/>
            <Stat number={user.followersCount} label='Seguidores'/>
            <Stat number={user.followedCount} label='Seguidos'/>
          </View>
        </View>

        {/* name, username, bio, buttons */}
        <View style={styles.infoBlock}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.username}>@{user.userName}</Text>
          {/* Puedes agregar bio cuando tu backend lo tenga */}

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: COLORS.black,
    fontWeight: '600',
  },
})
