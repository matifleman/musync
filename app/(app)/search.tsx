import FilterChips from '@/components/FilterChips'
import FollowButton from '@/components/FollowButton'
import { COLORS } from '@/constants/Colors'
import { useToggleFollowUser } from '@/hooks/useToggleFollowUser'
import { useGenres } from '@/hooks/useGenres'
import { useInstruments } from '@/hooks/useInstruments'
import { useSearchBands } from '@/hooks/useSearchBands'
import { useSearchUsers } from '@/hooks/useSearchUsers'
import { BandSearchResult } from '@/types/Band.type'
import { UserSearchResult } from '@/types/User.type'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

const DEFAULT_AVATAR = require('@/assets/dummyImages/avatars/avatar0.jpg')

type UserResultItem = UserSearchResult & { kind: 'user' }
type BandResultItem = BandSearchResult & { kind: 'band' }
type ResultItem = UserResultItem | BandResultItem

export default function Search() {
  // Screen level on purpose: renderUsuario is a plain function invoked from
  // renderItem, so a hook cannot live inside it. The target comes in as a
  // mutation variable instead.
  const toggleFollow = useToggleFollowUser()
  const [busqueda, setBusqueda] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedInstrumentFilter, setSelectedInstrumentFilter] = useState<number | undefined>(undefined)
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<number | undefined>(undefined)

  // Buscar usuarios cuando cambia el texto de búsqueda
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedQuery(busqueda.trim())
    }, 300) // Espera 300ms después de que el usuario deje de escribir

    return () => clearTimeout(delayDebounce)
  }, [busqueda])

  const {
    data: usersData,
    isLoading: loadingUsers,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: loadingMoreUsers,
  } = useSearchUsers(debouncedQuery)
  const {
    data: bandsData,
    isLoading: loadingBands,
    fetchNextPage: fetchNextBands,
    hasNextPage: hasMoreBands,
    isFetchingNextPage: loadingMoreBands,
  } = useSearchBands(debouncedQuery, selectedInstrumentFilter, selectedGenreFilter)

  const usuarios = usersData?.pages.flat() ?? []
  const bandas = bandsData?.pages.flat() ?? []
  const loading = loadingUsers || loadingBands
  const loadingMore = loadingMoreUsers || loadingMoreBands

  const { data: instrumentCatalog = [] } = useInstruments()
  const { data: genreCatalog = [] } = useGenres()

  const handleEndReached = () => {
    if (hasMoreUsers && !loadingMoreUsers) fetchNextUsers()
    if (hasMoreBands && !loadingMoreBands) fetchNextBands()
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        setBusqueda('');
        setDebouncedQuery('');
      };
    }, [])
  );

  const renderUsuario = (item: UserResultItem) => {
    const avatarSource = item.foto ? { uri: item.foto } : DEFAULT_AVATAR

    return (
      <TouchableOpacity style={styles.usuarioItem} onPress={()=>router.push(`/user/${item.id}`)}>
        <Image source={avatarSource} style={styles.fotoPerfil} />

        <View style={styles.infoUsuario}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.followers}>{item.followersCount} followers</Text>
        </View>

        {/* Flips on tap and reverts on failure, so there is no pending state
            to track per row any more. */}
        <FollowButton
          following={item.siguiendo}
          loading={false}
          onPress={() =>
            toggleFollow.mutate({
              userId: item.id,
              nextFollowing: !item.siguiendo,
              displayName: `@${item.username}`,
            })
          }
        />
      </TouchableOpacity>
    )
  }

  const renderBanda = (item: BandResultItem) => {
    return (
      <TouchableOpacity style={styles.usuarioItem} onPress={() => router.push(`/band/${item.id}`)}>
        <View style={styles.fotoBanda}>
          <MaterialIcons name="library-music" size={24} color={COLORS.lightBlueX2} />
        </View>

        <View style={styles.infoUsuario}>
          <Text style={styles.username}>{item.name}</Text>
          <Text style={styles.followers}>{item.memberCount} members</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const userItems: UserResultItem[] = usuarios.map((u) => ({ kind: 'user', ...u }))
  const bandItems: BandResultItem[] = bandas.map((b) => ({ kind: 'band', ...b }))
  const sections = [
    { title: 'Users', data: userItems },
    { title: 'Bands', data: bandItems },
  ].filter((section) => section.data.length > 0)

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users or bands..."
          placeholderTextColor={COLORS.gray}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FilterChips
        label="Filter by instrument"
        items={instrumentCatalog}
        selectedId={selectedInstrumentFilter}
        onSelect={setSelectedInstrumentFilter}
      />
      <FilterChips
        label="Filter by genre"
        items={genreCatalog}
        selectedId={selectedGenreFilter}
        onSelect={setSelectedGenreFilter}
      />

      {loading && busqueda.trim().length > 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : (
        <SectionList<ResultItem>
          sections={sections}
          renderItem={({ item }) => item.kind === 'user' ? renderUsuario(item) : renderBanda(item)}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          contentContainerStyle={styles.listaContainer}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.white} style={styles.footerLoading} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {busqueda.trim().length > 0
                  ? 'We haven\'t found any users or bands'
                  : 'Search for users or bands'}
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
  fotoBanda: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.lightBlueX2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray,
    backgroundColor: COLORS.black,
    paddingTop: 12,
    paddingBottom: 6,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  footerLoading: {
    marginVertical: 16,
  },
})
