import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  ArrowLeft,
  Car,
  Truck,
  Bus,
  FileCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { AvailabilityTimer } from '@/components/AvailabilityTimer';
import { colors } from '@/constants/colors';
import { useDriverStore } from '@/store/driver-store';
import { Driver, VehicleCategory } from '@/types/driver';

export default function DriverProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { drivers, isLoading } = useDriverStore();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (id) {
      const foundDriver = drivers.find(d => d.id === id);
      if (foundDriver) {
        setDriver(foundDriver);
      }
    }
  }, [id, drivers]);

  const handleCallPress = () => {
    if (!driver) return;
    
    if (!driver.allowCalls) {
      Alert.alert(
        "Calls Disabled",
        "This driver has disabled calls. Please use chat instead."
      );
      return;
    }
    
    Alert.alert(
      "Call Driver",
      `Would you like to call ${driver.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Call",
          onPress: () => {
            // In a real app, this would initiate a call
            Alert.alert("Calling", `Calling ${driver.name}...`);
          }
        }
      ]
    );
  };

  const handleChatPress = () => {
    if (!driver || !isNavigationReady) return;
    
    // Use a timeout to ensure navigation happens after render cycle
    setTimeout(() => {
      router.push(`/chat/${driver.id}`);
    }, 200);
  };

  // Safely render vehicle icons
  const renderVehicleIcons = () => {
    if (!driver?.vehicleCategories || driver.vehicleCategories.length === 0) {
      return null;
    }

    return (
      <View style={styles.vehicleContainer}>
        {driver.vehicleCategories.map((category, index) => {
          let icon = null;
          
          switch(category) {
            case 'Car':
              icon = <Car size={20} color={colors.text} />;
              break;
            case 'Truck':
              icon = <Truck size={20} color={colors.text} />;
              break;
            case 'Bus':
            case 'Van':
              icon = <Bus size={20} color={colors.text} />;
              break;
            default:
              return null;
          }
          
          return (
            <View key={index} style={styles.vehicleItem}>
              {icon}
              <Text style={styles.vehicleText}>{category}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading && !driver) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading driver profile...</Text>
      </SafeAreaView>
    );
  }

  if (!driver) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Driver not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          type="outline"
          style={styles.backButtonFallback}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: driver.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: driver.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }} 
            style={styles.profileImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.profileGradient}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{driver.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{driver.rating.toFixed(1)}</Text>
              <Text style={styles.rides}>({driver.totalRides} rides)</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MapPin size={20} color={colors.textLight} />
            <Text style={styles.infoText}>{driver.distance} km away</Text>
          </View>
          
          {driver.governmentIdVerified && (
            <View style={styles.verifiedContainer}>
              <FileCheck size={20} color={colors.success} />
              <Text style={styles.verifiedText}>Government ID Verified</Text>
            </View>
          )}
          
          {renderVehicleIcons()}
          
          {driver.isAvailable && driver.currentAvailability && (
            <View style={styles.availabilityCard}>
              <View style={styles.availabilityHeader}>
                <View style={styles.availabilityStatus}>
                  <View style={styles.availabilityDot} />
                  <Text style={styles.availabilityText}>Available</Text>
                </View>
                <AvailabilityTimer endTime={driver.currentAvailability.endTime} />
              </View>
              
              <View style={styles.availabilityLocation}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.locationText}>
                  {driver.currentAvailability.location.address || "Current Location"}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Professional driver with {driver.totalRides}+ completed rides. 
              Available for both short and long distance trips.
              {driver.governmentIdVerified ? " Government ID verified for your safety." : ""}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesList}>
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Car size={20} color={colors.primary} />
                </View>
                <Text style={styles.serviceText}>Airport Transfers</Text>
              </View>
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Truck size={20} color={colors.primary} />
                </View>
                <Text style={styles.serviceText}>Moving Services</Text>
              </View>
              <View style={styles.serviceItem}>
                <View style={styles.serviceIconContainer}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <Text style={styles.serviceText}>24/7 Availability</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.callButton,
            !driver.allowCalls && styles.disabledButton
          ]} 
          onPress={handleCallPress}
          disabled={!driver.allowCalls}
          activeOpacity={0.7}
        >
          <Phone size={20} color={driver.allowCalls ? colors.card : colors.disabled} />
          <Text style={[
            styles.actionButtonText,
            styles.callButtonText,
            !driver.allowCalls && styles.disabledButtonText
          ]}>
            {driver.allowCalls ? "Call" : "Calls Disabled"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.chatButton]} 
          onPress={handleChatPress}
          activeOpacity={0.7}
        >
          <MessageSquare size={20} color={colors.card} />
          <Text style={[styles.actionButtonText, styles.chatButtonText]}>Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    marginBottom: 20,
  },
  backButtonFallback: {
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileImageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  profileInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 4,
  },
  rides: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
    marginLeft: 8,
  },
  vehicleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  availabilityCard: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  availabilityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  section: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  servicesList: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceText: {
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  callButton: {
    backgroundColor: colors.primary,
  },
  chatButton: {
    backgroundColor: colors.secondary,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  callButtonText: {
    color: colors.card,
  },
  chatButtonText: {
    color: colors.card,
  },
  disabledButtonText: {
    color: colors.textLight,
  },
});