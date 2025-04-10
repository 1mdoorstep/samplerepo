import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth-store';

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 format

export default function Login() {
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    setLocalError('');
    
    if (!PHONE_REGEX.test(phone)) {
      setLocalError('Please enter a valid phone number');
      return;
    }

    try {
      await login(phone);
      router.push('/(auth)/verify-otp');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>
      
      <TextInput
        style={[
          styles.input, 
          ...((error || localError) ? [styles.errorInput] : [])
        ]}
        placeholder="Phone Number"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setLocalError('');
        }}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      
      {(error || localError) && (
        <Text style={styles.errorText}>
          {error || localError}
        </Text>
      )}

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorInput: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 15,
    textAlign: 'center',
  },
});
