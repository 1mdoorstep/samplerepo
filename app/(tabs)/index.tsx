import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Image,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Clock, 
  RefreshCw, 
  Filter, 
  Plus, 
  X, 
  Zap,
  Building,
  Package,
  Truck,
  Car,
  Briefcase,
  ShoppingBag,
  Tool,
  Wrench,
  Shield,
  Utensils,
  Construction,
  Hammer,
  Paintbrush,
  Laptop,
  Wifi,
  Leaf,
  Heart,
  Stethoscope,
  Search,
  Bell,
  ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DriverCard } from '@/components/DriverCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { AdCard } from '@/components/AdCard';
import { DistanceSlider } from '@/components/DistanceSlider';
import { ModeSwitch } from '@/components/ModeSwitch';
import { AvailabilityTimer } from '@/components/AvailabilityTimer';
import { JobCard } from '@/components/JobCard';
import { PostJobForm } from '@/components/PostJobForm';
import { colors } from '@/constants/colors';
import { useDriverStore } from '@/store/driver-store';
import { useAuthStore } from '@/store/auth-store';
import { useJobStore } from '@/store/job-store';
import { Driver } from '@/types/driver';
import { Job, JobCategory } from '@/types/job';

// Featured workers/jobs
const FEATURED_ITEMS = [
  {
    id: 'feat1',
    title: 'Worker 1',
    address: '123 Property Street, City 1',
    price: '$4700',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    badges: 2
  },
  {
    id: 'feat2',
    title: 'Worker 2',
    address: '123 Property Street, City 2',
    price: '$3324',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    badges: 0
  },
  {
    id: 'feat3',
    title: 'Worker 3',
    address: '123 Property Street, City 3',
    price: '$5100',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    badges: 3
  }
];

// Job categories with icons
const JOB_CATEGORIES: { id: JobCategory; name: string; icon: React.ReactNode; trending?: boolean }[] = [
  { id: 'Rideshare', name: 'Drivers', icon: <Car size={24} color={colors.primary} />, trending: true },
  { id: 'Delivery', name: 'Delivery', icon: <Package size={24} color={colors.primary} />, trending: true },
  { id: 'Electrician', name: 'Electricians', icon: <Zap size={24} color={colors.primary} />, trending: true },
  { id: 'Plumbing', name: 'Plumbers', icon: <Wrench size={24} color={colors.primary} />, trending: true },
  { id: 'IT', name: 'IT Services', icon: <Laptop size={24} color={colors.primary} />, trending: true },
  { id: 'Logistics', name: 'Logistics', icon: <Truck size={24} color={colors.primary} /> },
  { id: 'Personal', name: 'Personal', icon: <Briefcase size={24} color={colors.primary} /> },
  { id: 'Commercial', name: 'Commercial', icon: <Building size={24} color={colors.primary} /> },
  { id: 'Shopping', name: 'Shopping', icon: <ShoppingBag size={24} color={colors.primary} /> },
  { id: 'Security', name: 'Security', icon: <Shield size={24} color={colors.primary} /> },
  { id: 'Food', name: 'Food Service', icon: <Utensils size={24} color={colors.primary} /> },
  { id: 'Construction', name: 'Construction', icon: <Construction size={24} color={colors.primary} /> },
  { id: 'Carpentry', name: 'Carpentry', icon: <Hammer size={24} color={colors.primary} /> },
  { id: 'Painting', name: 'Painting', icon: <Paintbrush size={24} color={colors.primary} /> },
  { id: 'Networking', name: 'Networking', icon: <Wifi size={24} color={colors.primary} /> },
  { id: 'Gardening', name: 'Gardening', icon: <Leaf size={24} color={colors.primary} /> },
  { id: 'Healthcare', name: 'Healthcare', icon: <Stethoscope size={24} color={colors.primary} /> },
  { id: 'Caregiving', name: 'Caregiving', icon: <Heart size={24} color={colors.primary} /> },
];

// Get trending categories
const TRENDING_CATEGORIES = JOB_CATEGORIES.filter(category => category.trending).slice(0, 5);

// Popular companies
const POPULAR_COMPANIES = [
  { id: 'comp1', name: 'Uber', logo: '🚗' },
  { id: 'comp2', name: 'Ola', logo: '🚕' },
  { id: 'comp3', name: 'Amazon', logo: '📦' },
  { id: 'comp4', name: 'Zomato', logo: '🍔' },
  { id: 'comp5', name: 'Swiggy', logo: '🍕' },
  { id: 'comp6', name: 'BigBasket', logo: '🛒' },
  { id: 'comp7', name: 'Urban Company', logo: '🔧' },
  { id: 'comp8', name: 'Flipkart', logo: '🛍️' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    availableDrivers, 
    fetchDrivers, 
    isLoading: driversLoading, 
    error: driversError,
    setAvailability,
    toggleCallPermission
  } = useDriverStore();
  
  const {
    jobs,
    fetchJobs,
    postJob,
    applyForJob,
    isLoading: jobsLoading
  } = useJobStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [maxDistance, setMaxDistance] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  
  // Animation refs
  const availabilityButtonScale = useRef(new Animated.Value(1)).current;
  const availabilityButtonOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<number | null>(null);

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Check if the current user is a driver - FIXED: Moved this before it's used
  const isDriver = user?.isDriver || false;
  
  // Find the current user's driver profile if they are a driver
  const currentDriverProfile = isDriver && user
    ? availableDrivers.find(driver => driver.userId === user.id)
    : undefined;
  
  // Check if the current driver is available
  const isAvailable = currentDriverProfile?.isAvailable || false;

  // Start pulse animation for Go Available button
  useEffect(() => {
    if (isDriver && !isAvailable) {
      const startPulseAnimation = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (timerRef.current !== null) {
            timerRef.current = setTimeout(startPulseAnimation, 2000) as unknown as number;
          }
        });
      };
      
      startPulseAnimation();
      return () => {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [isDriver, isAvailable, pulseAnim]);

  useEffect(() => {
    // Only fetch data if authenticated
    if (isAuthenticated && user) {
      fetchDrivers();
      fetchJobs();
    }
  }, [isAuthenticated, user, fetchDrivers, fetchJobs]);

  // Safe check for authentication
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDrivers(), fetchJobs()]);
    setRefreshing(false);
  };

  const handleCallPress = (driver: Driver) => {
    if (!driver.allowCalls) {
      Alert.alert(
        "Calls Disabled",
        "This professional has disabled calls. Please use chat instead."
      );
      return;
    }
    
    Alert.alert(
      "Call Professional",
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

  const handleChatPress = (driver: Driver) => {
    // Only navigate if navigation is ready
    if (isNavigationReady) {
      router.push(`/chat/${driver.id}`);
    }
  };

  const animateAvailabilityButton = () => {
    // Sequence of animations for the button
    Animated.sequence([
      // First scale up and fade slightly
      Animated.parallel([
        Animated.timing(availabilityButtonScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(availabilityButtonOpacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Then scale down and restore opacity
      Animated.parallel([
        Animated.timing(availabilityButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(availabilityButtonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const toggleAvailability = async () => {
    if (!currentDriverProfile) return;
    
    // Animate the button
    animateAvailabilityButton();
    
    try {
      await setAvailability(currentDriverProfile.id, !isAvailable);
      
      // Show confirmation
      Alert.alert(
        isAvailable ? "Availability Disabled" : "Now Available",
        isAvailable 
          ? "You are no longer shown as available" 
          : "You are now available for the next 4 hours"
      );
    } catch (err) {
      Alert.alert("Error", "Failed to update availability");
    }
  };

  const handleToggleCallPermission = async () => {
    if (!currentDriverProfile) return;
    
    try {
      await toggleCallPermission(currentDriverProfile.id);
      
      Alert.alert(
        "Call Permission Updated",
        currentDriverProfile.allowCalls 
          ? "Calls have been disabled" 
          : "Calls have been enabled"
      );
    } catch (err) {
      Alert.alert("Error", "Failed to update call permission");
    }
  };

  const toggleDriverMode = () => {
    setIsDriverMode(!isDriverMode);
  };

  const handlePostJob = async (jobData: any) => {
    try {
      await postJob(jobData);
      setShowPostJobModal(false);
      Alert.alert("Success", "Job posted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to post job");
    }
  };

  const handleApplyForJob = async (jobId: string) => {
    if (!currentDriverProfile) {
      Alert.alert("Error", "You need to be registered as a professional to apply for jobs");
      return;
    }
    
    try {
      await applyForJob(jobId, currentDriverProfile.id);
      Alert.alert("Success", "You have successfully applied for this job");
    } catch (error) {
      Alert.alert("Error", "Failed to apply for job");
    }
  };

  const handleCategorySelect = (category: JobCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(selectedCompany === companyId ? null : companyId);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'All') {
      setSelectedCategory(tab as JobCategory);
    } else {
      setSelectedCategory(null);
    }
  };

  // Filter drivers based on distance
  const filteredDrivers = availableDrivers
    .filter(driver => driver.userId !== user.id)
    .filter(driver => driver.distance && driver.distance <= maxDistance);

  // Filter jobs based on status, category, and company
  const filteredJobs = jobs
    .filter(job => job.status === 'Open')
    .filter(job => !selectedCategory || job.category === selectedCategory)
    .filter(job => !selectedCompany || job.companyId === selectedCompany);

  const renderDriverCard = ({ item }: { item: Driver }) => (
    <DriverCard 
      driver={item} 
      onCallPress={() => handleCallPress(item)}
      onChatPress={() => handleChatPress(item)}
    />
  );

  const renderJobCard = ({ item }: { item: Job }) => (
    <JobCard 
      job={item}
      onPress={() => Alert.alert("Job Details", `You selected: ${item.title}`)}
      onApply={() => handleApplyForJob(item.id)}
    />
  );

  const renderEmptyDriversState = () => (
    <EmptyState
      icon={<Clock size={64} color={colors.textLight} />}
      title="No Professionals Available"
      message="There are no professionals available at the moment. Please check back later or refresh to see new listings."
      action={
        <Button
          title="Refresh"
          onPress={handleRefresh}
          type="outline"
          icon={<RefreshCw size={16} color={colors.primary} />}
        />
      }
    />
  );

  const renderEmptyJobsState = () => (
    <EmptyState
      icon={<Clock size={64} color={colors.textLight} />}
      title="No Open Jobs"
      message="There are no open jobs at the moment. Check back later or post a job yourself."
      action={
        <Button
          title="Post a Job"
          onPress={() => setShowPostJobModal(true)}
          type="primary"
          icon={<Plus size={16} color={colors.card} />}
        />
      }
    />
  );

  const renderFeaturedItem = ({ item }: { item: typeof FEATURED_ITEMS[0] }) => (
    <TouchableOpacity 
      style={styles.featuredItem}
      activeOpacity={0.9}
      onPress={() => Alert.alert("Featured Item", `You selected: ${item.title}`)}
    >
      <Image 
        source={{ uri: item.imageUrl }}
        style={styles.featuredImage}
        resizeMode="cover"
      />
      {item.badges > 0 && (
        <View style={styles.badgeContainer}>
          <Zap size={12} color="#fff" />
          <Text style={styles.badgeText}>+{item.badges}</Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.featuredGradient}
      >
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredAddress}>{item.address}</Text>
        <Text style={styles.featuredPrice}>{item.price}</Text>
      </LinearGradient>
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={() => Alert.alert("Favorite", `Added ${item.title} to favorites`)}
      >
        <Heart size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'KA'}
            </Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hello</Text>
            <Text style={styles.userName}>{user.name || 'Karanam Ajith kumar'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => router.push('/drivers')}
      >
        <Search size={20} color={colors.textLight} />
        <Text style={styles.searchText}>Search for anything</Text>
        <Filter size={20} color={colors.textLight} />
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Featured Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity onPress={() => router.push('/drivers')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {FEATURED_ITEMS.map(item => (
              <View key={item.id} style={{width: 180, marginRight: 12}}>
                {renderFeaturedItem({item})}
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* Our Recommendations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Recommendation</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'All' && styles.activeTab]}
              onPress={() => handleTabChange('All')}
            >
              <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>All</Text>
            </TouchableOpacity>
            
            {TRENDING_CATEGORIES.map(category => (
              <TouchableOpacity 
                key={category.id}
                style={[styles.tab, activeTab === category.id && styles.activeTab]}
                onPress={() => handleTabChange(category.id)}
              >
                <Text style={[styles.tabText, activeTab === category.id && styles.activeTabText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.recommendationGrid}>
            {filteredDrivers.slice(0, 4).map(driver => (
              <TouchableOpacity 
                key={driver.id}
                style={styles.recommendationItem}
                onPress={() => router.push(`/driver/${driver.id}`)}
              >
                <Image 
                  source={{ uri: driver.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }}
                  style={styles.recommendationImage}
                />
                {driver.recentHires > 0 && (
                  <View style={styles.hireBadge}>
                    <Text style={styles.hireBadgeText}>+{driver.recentHires}</Text>
                  </View>
                )}
                <View style={styles.recommendationInfo}>
                  <Text style={styles.recommendationName} numberOfLines={1}>{driver.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{driver.rating.toFixed(1)} ★</Text>
                    <Text style={styles.jobsText}>({driver.totalRides})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Driver Mode Toggle */}
        {isDriver && (
          <View style={styles.driverModeContainer}>
            <ModeSwitch 
              isDriverMode={isDriverMode} 
              onToggle={toggleDriverMode}
            />
            
            {isDriverMode && (
              <View style={styles.availabilitySection}>
                <View style={styles.availabilityHeader}>
                  <Text style={styles.availabilityTitle}>
                    {isAvailable ? "You're Available" : "Go Available"}
                  </Text>
                  
                  {isAvailable && currentDriverProfile?.currentAvailability && (
                    <AvailabilityTimer 
                      endTime={currentDriverProfile.currentAvailability.endTime} 
                    />
                  )}
                </View>
                
                <View style={styles.driverActionRow}>
                  <Animated.View
                    style={{
                      flex: 1,
                      transform: [
                        { scale: availabilityButtonScale },
                        { scale: isAvailable ? 1 : pulseAnim }
                      ],
                      opacity: availabilityButtonOpacity,
                    }}
                  >
                    <Button
                      title={isAvailable ? "Stop Availability" : "Go Available"}
                      onPress={toggleAvailability}
                      type={isAvailable ? "danger" : "success"}
                      size="medium"
                      style={styles.availabilityButton}
                    />
                  </Animated.View>
                  
                  <Button
                    title={currentDriverProfile?.allowCalls ? "Disable Calls" : "Enable Calls"}
                    onPress={handleToggleCallPermission}
                    type="outline"
                    size="medium"
                    style={styles.callPermissionButton}
                  />
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Available Jobs or Professionals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isDriverMode ? "Available Jobs" : "Available Professionals"}
            </Text>
            
            {!isDriverMode && (
              <TouchableOpacity 
                style={styles.postJobButton}
                onPress={() => setShowPostJobModal(true)}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.postJobText}>Post Job</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isDriverMode ? (
            filteredJobs.length > 0 ? (
              filteredJobs.slice(0, 3).map(job => (
                <JobCard 
                  key={job.id}
                  job={job}
                  onPress={() => Alert.alert("Job Details", `You selected: ${job.title}`)}
                  onApply={() => handleApplyForJob(job.id)}
                />
              ))
            ) : (
              renderEmptyJobsState()
            )
          ) : (
            filteredDrivers.length > 0 ? (
              filteredDrivers.slice(0, 3).map(driver => (
                <DriverCard 
                  key={driver.id}
                  driver={driver} 
                  onCallPress={() => handleCallPress(driver)}
                  onChatPress={() => handleChatPress(driver)}
                />
              ))
            ) : (
              renderEmptyDriversState()
            )
          )}
          
          {((isDriverMode && filteredJobs.length > 3) || (!isDriverMode && filteredDrivers.length > 3)) && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/drivers')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      {showPostJobModal && (
        <Modal
          visible={showPostJobModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPostJobModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <PostJobForm
                onSubmit={handlePostJob}
                onCancel={() => setShowPostJobModal(false)}
              />
            </View>
          </View>
        </Modal>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
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
  searchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  featuredContainer: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  featuredItem: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 220,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      }
    }),
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredAddress: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  featuredPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  heartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.text,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '500',
  },
  recommendationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  recommendationItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
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
  recommendationImage: {
    width: '100%',
    height: 120,
  },
  recommendationInfo: {
    padding: 8,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '500',
  },
  jobsText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  hireBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.warning,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hireBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  driverModeContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
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
  availabilitySection: {
    marginTop: 16,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  driverActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  availabilityButton: {
    flex: 1,
  },
  callPermissionButton: {
    flex: 1,
  },
  postJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  postJobText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
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