import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Animated,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Ticket, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, error, clearError, isLoading, isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('DEMO123'); // Pre-filled for demo
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    referralCode: '',
  });
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formRef = useRef(null);

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
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

  const validate = () => {
    const newErrors = {
      name: '',
      phone: '',
      referralCode: '',
    };
    let isValid = true;
    
    if (!name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!phone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    if (!referralCode) {
      newErrors.referralCode = 'Referral code is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validate() || !isNavigationReady) return;
    
    try {
      await signup(name, phone, referralCode);
      // Navigation will happen automatically in the useEffect above
    } catch (err) {
      // Error is handled in the store
      console.error(err);
    }
  };

  const handleLogin = () => {
    if (isNavigationReady) {
      router.push('/login');
    }
  };

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

  if (isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        <View style={styles.imageTextContainer}>
          <Text style={styles.imageTitle}>Fyke</Text>
          <Text style={styles.imageSubtitle}>Join our professional network</Text>
        </View>
      </View>
      
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
        ref={formRef}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up with a referral code to join our professional network
            </Text>
          </View>
          
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              leftIcon={<User size={20} color={colors.textLight} />}
            />
            
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={20} color={colors.textLight} />}
            />
            
            <Input
              label="Referral Code"
              placeholder="Enter referral code"
              value={referralCode}
              onChangeText={setReferralCode}
              error={errors.referralCode}
              leftIcon={<Ticket size={20} color={colors.textLight} />}
              autoCapitalize="characters"
            />
            
            <Text style={styles.hint}>
              For demo purposes, any referral code will work
            </Text>
            
            <Button
              title="Sign Up"
              onPress={handleSignup}
              type="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              icon={<ArrowRight size={20} color={colors.card} />}
              iconPosition="right"
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageTextContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  imageTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  imageSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
    marginBottom: 24,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});