import React, { useState } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

// Datos de ejemplo - luego reemplazar con llamadas a tu API
const USUARIOS_EJEMPLO = [
  { id: 1, username: 'juan_perez', nombre: 'Juan Pérez', foto: '@/assets/dummyImages/avatars/avatar0.jpg', siguiendo: false },
  { id: 2, username: 'maria_gomez', nombre: 'María Gómez', foto: '@/assets/dummyImages/avatars/avatar0.jpg', siguiendo: true },
  { id: 3, username: 'carlos_rodriguez', nombre: 'Carlos Rodríguez', foto: '@/assets/dummyImages/avatars/avatar0.jpg', siguiendo: false },
  { id: 4, username: 'ana_martinez', nombre: 'Ana Martínez', foto: '@/assets/dummyImages/avatars/avatar0.jpg', siguiendo: false },
  { id: 5, username: 'pedro_sanchez', nombre: 'Pedro Sánchez', foto: '@/assets/dummyImages/avatars/avatar0.jpg', siguiendo: true },
]

export default function Search() {
  const [busqueda, setBusqueda] = useState('')
  const [usuarios, setUsuarios] = useState(USUARIOS_EJEMPLO)

  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const toggleSeguir = (id: number) => {
    setUsuarios(usuarios.map(usuario => 
      usuario.id === id 
        ? { ...usuario, siguiendo: !usuario.siguiendo }
        : usuario
    ))
  }

  const renderUsuario = ({ item }: { item: typeof USUARIOS_EJEMPLO[0] }) => (
    <TouchableOpacity style={styles.usuarioItem}>
      <Image source={{ uri: item.foto }} style={styles.fotoPerfil} />
      
      <View style={styles.infoUsuario}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.nombre}>{item.nombre}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.botonSeguir, item.siguiendo && styles.botonSiguiendo]}
        onPress={() => toggleSeguir(item.id)}
      >
        <Text style={[styles.textoBoton, item.siguiendo && styles.textoSiguiendo]}>
          {item.siguiendo ? 'Siguiendo' : 'Seguir'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          placeholderTextColor={COLORS.gray}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={usuariosFiltrados}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {busqueda ? 'No se encontraron usuarios' : 'Busca usuarios para seguir'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const COLORS = {
  black: '#000',
  white: '#fff',
  gray: '#888',
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
  botonSeguir: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
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