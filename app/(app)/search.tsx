import { COLORS } from '@/constants/Colors'
import { useSession } from '@/contexts/AuthContext'
import { useSearchUsers } from '@/hooks/useSearchUsers'
import { usersService } from '@/services/usersService'
import { UserSearchResult } from '@/types/User.type'
import { useQueryClient } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'

const DEFAULT_AVATAR = require('@/assets/dummyImages/avatars/avatar0.jpg')

export default function Search() {
  const { currentUser } = useSession()
  const queryClient = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [followingInProgress, setFollowingInProgress] = useState<number | null>(null)

  // Buscar usuarios cuando cambia el texto de búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedQuery(busqueda.trim())
    }, 300) // Espera 300ms después de que el usuario deje de escribir

    return () => clearTimeout(delayDebounce)
  }, [busqueda])

  const { data: usuarios = [], isFetching: loading } = useSearchUsers(debouncedQuery)

  const toggleSeguir = async (usuario: UserSearchResult) => {
    if (!currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Debes iniciar sesión para seguir usuarios',
      })
      return
    }

    try {
      setFollowingInProgress(usuario.id)

      const result = usuario.siguiendo
        ? await usersService.unfollowUser(usuario.id)
        : await usersService.followUser(usuario.id)

      Toast.show({
        type: 'success',
        text1: result.isFollowing ? 'Siguiendo' : 'Dejaste de seguir',
        text2: `@${usuario.username}`,
      })

      // Actualizar el resultado cacheado de esta búsqueda con los conteos reales del servidor
      queryClient.setQueryData<UserSearchResult[]>(
        ['users', 'search', debouncedQuery],
        (old) => old?.map(u => u.id === usuario.id
          ? { ...u, siguiendo: result.isFollowing, followersCount: result.followersCount }
          : u)
      )
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo completar la acción',
      })
    } finally {
      setFollowingInProgress(null)
    }
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        setBusqueda('');
        setDebouncedQuery('');
        setFollowingInProgress(null);
      };
    }, [])
  );

  const renderUsuario = ({ item }: { item: UserSearchResult }) => {
    const isProcessing = followingInProgress === item.id
    const avatarSource = item.foto ? { uri: item.foto } : DEFAULT_AVATAR

    return (
      <TouchableOpacity style={styles.usuarioItem} onPress={()=>router.push(`/user/${item.id}`)}>
        <Image source={avatarSource} style={styles.fotoPerfil} />

        <View style={styles.infoUsuario}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.followers}>{item.followersCount} followers</Text>
        </View>

        <TouchableOpacity
          style={[styles.botonSeguir, item.siguiendo && styles.botonSiguiendo]}
          onPress={() => toggleSeguir(item)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={[styles.textoBoton, item.siguiendo && styles.textoSiguiendo]}>
              {item.siguiendo ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={COLORS.gray}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {loading && busqueda.trim().length > 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          renderItem={renderUsuario}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {busqueda.trim().length > 0
                  ? 'We haven\'t found any users'
                  : 'Search users to follow'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listaContainer: {
    padding: 12,
  },
  usuarioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  fotoPerfil: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  infoUsuario: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: COLORS.white,
  },
  nombre: {
    fontSize: 14,
    color: COLORS.gray,
  },
  followers: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  botonSeguir: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  botonSiguiendo: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textoBoton: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  textoSiguiendo: {
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
})
