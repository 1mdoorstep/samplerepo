import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpInput } from '@/components/OtpInput';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function OtpScreen() {
  const router = useRouter();
  const { verifyOtp, error, clearError, isLoading, isAuthenticated } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isNavigationReady) {
      // Use a timeout to ensure navigation happens after render cycle
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isNavigationReady, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Clear any store errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Show error alert if there's an error from the store
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleVerify = async () => {
    if (otp.length !== 4 || !isNavigationReady) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }
    
    try {
      await verifyOtp(otp);
      // Navigation will happen automatically in the useEffect above
    } catch (err) {
      // Error is handled in the store
      console.error(err);
    }
  };

  const handleResend = () => {
    // In a real app, this would call the login function again
    setCountdown(30);
    Alert.alert('OTP Resent', 'A new OTP has been sent to your phone');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to your phone
          </Text>
        </View>
        
        <View style={styles.form}>
          <OtpInput
            length={4}
            value={otp}
            onChange={setOtp}
            autoFocus
          />
          
          <Text style={styles.hint}>
            For demo purposes, use OTP: 1234
          </Text>
          
          <Button
            title="Verify"
            onPress={handleVerify}
            type="primary"
            size="large"
            loading={isLoading}
            disabled={isLoading || otp.length !== 4}
            style={styles.button}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Did not receive the code?</Text>
          {countdown > 0 ? (
            <Text style={styles.countdown}>Resend in {countdown}s</Text>
          ) : (
            <Button
              title="Resend OTP"
              onPress={handleResend}
              type="text"
              size="small"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  form: {
    alignItems: 'center',
    marginBottom: 24,
  },
  hint: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 32,
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  countdown: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});