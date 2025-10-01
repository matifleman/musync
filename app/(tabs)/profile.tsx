import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import ThemedText from '@/components/ThemedText'
import {COLORS} from '@/constants/Colors'

export default function Profile() {
  const user = {
    nombre: "Matías",
    apellido: "Fleman",
    foto: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/OJAUXQNN5BD77I2AIO4DRVS2KI.jpeg"
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.foto }} style={styles.avatar} />

      <ThemedText style={styles.name}>
        {user.nombre} {user.apellido}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.black,
    padding: 20
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20
  },
  name: {
    fontSize: 22,
    fontWeight: "bold"
  }
})
