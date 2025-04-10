import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const { verifyOtp, isLoading, error } = useAuthStore();

  const handleVerify = async () => {
    setLocalError('');
    
    if (otp.length !== 6) {
      setLocalError('Please enter a 6-digit code');
      return;
    }

    try {
      await verifyOtp(otp);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>We've sent a 6-digit code to your phone</Text>
      
      <TextInput
        style={[
          styles.input,
          ...((error || localError) ? [styles.errorInput] : [])
        ]}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={(text) => {
          setOtp(text);
          setLocalError('');
        }}
        keyboardType="number-pad"
        maxLength={6}
      />
      
      {(error || localError) && (
        <Text style={styles.errorText}>
          {error || localError}
        </Text>
      )}

      <TouchableOpacity 
        style={[styles.button, (isLoading || otp.length !== 6) && styles.disabledButton]} 
        onPress={handleVerify}
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
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