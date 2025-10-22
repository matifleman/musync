import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import { useSession } from '@/contexts/AuthContext';
import { registrationSchema } from '@/schemas/registrationSchema';
import { RegistrationRequest } from '@/types/RegistrationRequest.type';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
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


export default function SignUp() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const { signUp } = useSession();

  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<RegistrationRequest>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (registrationRequest: RegistrationRequest) => {
    setLoading(true);
    try {
      console.log('[*] Registration request', registrationRequest);
      await signUp(registrationRequest);
      router.replace('/(app)');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo_musync.png')}
          style={styles.logo}
        />

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                placeholderTextColor={COLORS.black}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
            </>
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                placeholderTextColor={COLORS.black}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}
            </>
          )}
        />

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                placeholderTextColor={COLORS.black}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
            </>
          )}
        />

        <Controller
          control={control}
          name="bornDate"
          render={({ field: { onChange, value } }) => (
            <>
              <AnimatedPressable
                style={styles.input}
                onPress={() => setShowDatePicker(true)} // manejás el estado para mostrar el picker
              >
                <Text style={{ color: COLORS.black }}>
                  {value ? new Date(value).toLocaleDateString() : 'Born date'}
                </Text>
              </AnimatedPressable>

              {showDatePicker && (
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) onChange(selectedDate.toISOString().split('T')[0]);
                  }}
                />
              )}
              {errors.bornDate && (
                <Text style={styles.errorText}>{errors.bornDate.message}</Text>
              )}
            </>
          )}
        />

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
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
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
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </>
          )}
        />

        <AnimatedPressable style={styles.signUpButton} onPress={handleSubmit(onSubmit)}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </AnimatedPressable>

        <AnimatedPressable onPress={() => router.replace('/sign-in')}>
          <Text style={styles.createAccountText}>Already have an account?</Text>
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
    marginBottom: 10,
    borderRadius: 10,
  },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
  },

  signUpButton: {
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
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginVertical: 8,
    paddingHorizontal: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: FONTS.spaceMono,
  },

  errorText: {
    color: COLORS.red,
    fontSize: 12,
  }

});