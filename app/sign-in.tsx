import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import { useSession } from '@/contexts/AuthContext';
import { loginSchema } from '@/schemas/loginSchema'; // 👈 your Zod schema
import { LoginRequest } from '@/types/LoginRequest.type';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { signIn } = useSession();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (loginRequest: LoginRequest) => {
    setLoading(true);
    try {
      console.log('login request', loginRequest);
      await signIn(loginRequest);
      router.replace('/(app)');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/images/logo_musync.png')} style={styles.logo} />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={COLORS.black}
              />
              {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  autoCapitalize='none'
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  placeholderTextColor={COLORS.black}
                />
                <AnimatedPressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <FontAwesome
                    name={isPasswordVisible ? 'eye' : 'eye-slash'}
                    size={24}
                    color={COLORS.lightBlue}
                  />
                </AnimatedPressable>
              </View>
              {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}
            </>
          )}
        />

        <AnimatedPressable style={styles.loginButton} onPress={handleSubmit(onSubmit)}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </AnimatedPressable>

        <AnimatedPressable onPress={() => router.replace('/sign-up')}>
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
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
  },

  loginButton: {
    backgroundColor: COLORS.blue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },

  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
    fontSize: 16,
  },

  createAccountText: {
    color: COLORS.lightBlue,
    textAlign: "center",
    marginTop: 12,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginVertical: 12,
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: FONTS.spaceMono,
  },

});