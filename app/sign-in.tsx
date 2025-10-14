import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    router.replace("/(app)");
    if (!email || !password) {
      Alert.alert('Error', 'Complete all fields');
      return;
    }


    // setLoading(true);
    // try {
    //   const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password }),
    //   });

    //   if (!res.ok) throw new Error('Credenciales inválidas');
    //   const data = await res.json();

    //   // Guardar token, navegar, etc.
    //   // navigation.navigate('Home');
    // } catch (err) {
    //   Alert.alert('Error', (err as Error).message);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo_musync.png')}
          style={styles.logo}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={COLORS.black}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor={COLORS.black}
          />
          <AnimatedPressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <FontAwesome name={isPasswordVisible ? "eye" : "eye-slash"} size={24} color={COLORS.lightBlue} />
          </AnimatedPressable>
        </View>

        <AnimatedPressable style={styles.button} onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </AnimatedPressable>

        <AnimatedPressable onPress={() => router.replace("/sign-up")}>
          <Text style={styles.createAccountText}>Don&apos;t have an account yet? Create one</Text>
        </AnimatedPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBlue,
    justifyContent: 'center',
    padding: 20,
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 36,
    borderRadius: 10,
  },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
  },

  button: {
    backgroundColor: COLORS.blue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
    fontSize: 16,
  },

  createAccountText: {
    color: COLORS.lightBlue,
    textAlign: "center",
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginBottom: 15,
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: FONTS.spaceMono,
  },

});