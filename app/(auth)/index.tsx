import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { 
  Car, 
  Truck, 
  Package, 
  Briefcase, 
  Zap, 
  Wrench, 
  Shield, 
  Utensils, 
  Construction,
  Hammer,
  Paintbrush,
  Laptop
} from 'lucide-react-native';

export default function WelcomeScreen() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  // Set navigation ready after first render with a longer delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 1500); // Increased delay for better stability
    return () => clearTimeout(timer);
  }, []);

  // Start animations when component mounts
  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // If user is authenticated, redirect to tabs AFTER navigation is ready
  useEffect(() => {
    if (isAuthenticated && isNavigationReady) {
      // Use a timeout to ensure navigation happens after render cycle
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isNavigationReady, router]);

  const handleLogin = () => {
    // Only navigate if navigation is ready
    if (isNavigationReady) {
      // Use a timeout to ensure navigation happens after render cycle
      setTimeout(() => {
        router.push('/login');
      }, 200);
    }
  };

  const handleSignup = () => {
    // Only navigate if navigation is ready
    if (isNavigationReady) {
      // Use a timeout to ensure navigation happens after render cycle
      setTimeout(() => {
        router.push('/signup');
      }, 200);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        />
        <Animated.View 
          style={[
            styles.heroTextContainer,
            { opacity: titleAnim }
          ]}
        >
          <Text style={styles.heroTitle}>Fyke</Text>
          <Text style={styles.heroSubtitle}>Professional Hiring Platform</Text>
        </Animated.View>
      </View>
      
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Animated.View 
          style={[styles.iconGrid, { opacity: iconAnim }]}
        >
          <View style={styles.iconRow}>
            <View style={styles.iconContainer}>
              <Car size={28} color={colors.primary} />
              <Text style={styles.iconText}>Drivers</Text>
            </View>
            <View style={styles.iconContainer}>
              <Zap size={28} color={colors.primary} />
              <Text style={styles.iconText}>Electricians</Text>
            </View>
            <View style={styles.iconContainer}>
              <Wrench size={28} color={colors.primary} />
              <Text style={styles.iconText}>Plumbers</Text>
            </View>
          </View>
          
          <View style={styles.iconRow}>
            <View style={styles.iconContainer}>
              <Shield size={28} color={colors.primary} />
              <Text style={styles.iconText}>Security</Text>
            </View>
            <View style={styles.iconContainer}>
              <Construction size={28} color={colors.primary} />
              <Text style={styles.iconText}>Construction</Text>
            </View>
            <View style={styles.iconContainer}>
              <Laptop size={28} color={colors.primary} />
              <Text style={styles.iconText}>IT Services</Text>
            </View>
          </View>
        </Animated.View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Find Skilled Professionals</Text>
          <Text style={styles.description}>
            Connect with verified professionals across multiple industries. 
            Post jobs, hire talent, or offer your services - all in one platform.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Login" 
            onPress={handleLogin}
            type="primary"
            size="large"
            style={styles.button}
          />
          <Button 
            title="Sign Up with Referral" 
            onPress={handleSignup}
            type="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    height: '40%',
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconGrid: {
    marginBottom: 24,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '30%',
    aspectRatio: 1,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  iconText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
});