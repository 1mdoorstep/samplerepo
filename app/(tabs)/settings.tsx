import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Image,
  Platform,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Phone, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Ticket,
  Car,
  CreditCard,
  Clock,
  Settings as SettingsIcon,
  FileCheck
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useDriverStore } from '@/store/driver-store';
import { AdCard } from '@/components/AdCard';
import { ProfileEditForm } from '@/components/ProfileEditForm';

// Mock ads data
const ADS = [
  {
    id: 'ad4',
    title: 'Premium Subscription',
    description: 'Get priority in search results and remove ads with Premium.',
    imageUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b2d70b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  }
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { drivers, toggleCallPermission, updateDriverProfile } = useDriverStore();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [ads, setAds] = useState(ADS);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // Find the current user's driver profile if they are a driver
  const currentDriverProfile = user?.isDriver && user?.id
    ? drivers.find(driver => driver.userId === user.id)
    : undefined;
  
  const [allowCalls, setAllowCalls] = useState(currentDriverProfile?.allowCalls || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    // Update allowCalls state when currentDriverProfile changes
    if (currentDriverProfile) {
      setAllowCalls(currentDriverProfile.allowCalls);
    }
  }, [currentDriverProfile]);

  // Don't render content until authentication is checked
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            if (isNavigationReady) {
              setTimeout(() => {
                router.replace('/(auth)');
              }, 200);
            }
          }
        }
      ]
    );
  };

  const handleToggleCalls = async () => {
    if (!currentDriverProfile) return;
    
    try {
      await toggleCallPermission(currentDriverProfile.id);
      setAllowCalls(!allowCalls);
      
      Alert.alert(
        allowCalls ? "Calls Disabled" : "Calls Enabled",
        allowCalls 
          ? "Customers will not be able to call you directly." 
          : "Customers can now call you directly."
      );
    } catch (err) {
      Alert.alert("Error", "Failed to update call settings");
    }
  };

  const handleVehicleCategories = () => {
    setShowEditProfileModal(true);
  };

  const handleReferralCode = () => {
    if (!user?.referralCode) return;
    
    Alert.alert(
      "Your Referral Code",
      `Share this code with other drivers: ${user.referralCode}`,
      [
        {
          text: "Copy",
          onPress: () => {
            // In a real app, this would copy to clipboard
            Alert.alert("Copied", "Referral code copied to clipboard");
          }
        },
        {
          text: "Close",
          style: "cancel"
        }
      ]
    );
  };

  const handleAdClose = (adId: string) => {
    setAds(ads.filter(ad => ad.id !== adId));
  };

  const handleUpdateProfile = async (profileData: any) => {
    if (!currentDriverProfile) return;
    
    try {
      await updateDriverProfile({
        ...currentDriverProfile,
        ...profileData,
      });
      
      setShowEditProfileModal(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image 
            source={{ 
              uri: currentDriverProfile?.profilePicture || 
                'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' 
            }} 
            style={styles.profileImage} 
          />
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profilePhone}>{user.phone}</Text>
          
          {currentDriverProfile?.governmentIdVerified && (
            <View style={styles.verifiedBadge}>
              <FileCheck size={16} color={colors.success} />
              <Text style={styles.verifiedText}>Government ID Verified</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => setShowEditProfileModal(true)}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {ads.length > 0 && (
          <View style={styles.adContainer}>
            {ads.map(ad => (
              <AdCard
                key={ad.id}
                title={ad.title}
                description={ad.description}
                imageUrl={ad.imageUrl}
                onClose={() => handleAdClose(ad.id)}
                onPress={() => Alert.alert("Ad Clicked", `You clicked on: ${ad.title}`)}
              />
            ))}
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <User size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Personal Information</Text>
              <Text style={styles.menuItemSubtext}>Update your profile details</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <CreditCard size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Payment Methods</Text>
              <Text style={styles.menuItemSubtext}>Manage your payment options</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          {user.isDriver && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleReferralCode}
            >
              <View style={styles.menuIconContainer}>
                <Ticket size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Your Referral Code</Text>
                <Text style={styles.menuItemSubtext}>{user.referralCode}</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
          
          {user.isDriver && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleVehicleCategories}
            >
              <View style={styles.menuIconContainer}>
                <Car size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Vehicle Categories</Text>
                <Text style={styles.menuItemSubtext}>Manage your vehicle types</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Clock size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Activity History</Text>
              <Text style={styles.menuItemSubtext}>View your past activities</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <FileCheck size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Government ID</Text>
              <Text style={styles.menuItemSubtext}>
                {currentDriverProfile?.governmentIdVerified 
                  ? "ID verified" 
                  : "Upload your government ID"}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Notifications</Text>
              <Text style={styles.menuItemSubtext}>Manage notification settings</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.disabled, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.card}
              ios_backgroundColor={colors.disabled}
            />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <SettingsIcon size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Dark Mode</Text>
              <Text style={styles.menuItemSubtext}>Toggle dark theme</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: colors.disabled, true: colors.primaryLight }}
              thumbColor={darkModeEnabled ? colors.primary : colors.card}
              ios_backgroundColor={colors.disabled}
            />
          </View>
          
          {user.isDriver && (
            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Phone size={20} color={colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Allow Calls</Text>
                <Text style={styles.menuItemSubtext}>Let customers call you directly</Text>
              </View>
              <Switch
                value={allowCalls}
                onValueChange={handleToggleCalls}
                trackColor={{ false: colors.disabled, true: colors.primaryLight }}
                thumbColor={allowCalls ? colors.primary : colors.card}
                ios_backgroundColor={colors.disabled}
              />
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Help & Support</Text>
              <Text style={styles.menuItemSubtext}>Get help with the app</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <Text style={styles.menuItemSubtext}>Read our privacy policy</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
      
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ProfileEditForm
              initialData={{
                name: user.name,
                phone: user.phone,
                profilePicture: currentDriverProfile?.profilePicture,
                governmentId: currentDriverProfile?.governmentId,
                vehicleCategories: currentDriverProfile?.vehicleCategories
              }}
              onSubmit={handleUpdateProfile}
              onCancel={() => setShowEditProfileModal(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.border,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
    marginLeft: 6,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.highlight,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  adContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
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
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 24,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
});