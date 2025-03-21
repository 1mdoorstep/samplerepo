import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  Users, 
  X, 
  Zap, 
  MapPin,
  Car,
  Truck,
  Bus,
  Briefcase,
  Tool,
  Wrench,
  Shield,
  Utensils,
  Construction,
  Hammer,
  Paintbrush,
  Laptop,
  ChevronRight
} from 'lucide-react-native';
import { DriverCard } from '@/components/DriverCard';
import { EmptyState } from '@/components/EmptyState';
import { DistanceSlider } from '@/components/DistanceSlider';
import { AdCard } from '@/components/AdCard';
import { colors } from '@/constants/colors';
import { useDriverStore } from '@/store/driver-store';
import { useAuthStore } from '@/store/auth-store';
import { Driver, VehicleCategory } from '@/types/driver';

// Mock ads data
const ADS = [
  {
    id: 'ad3',
    title: 'Refer a Professional',
    description: 'Earn $50 for each professional you refer who completes 10 jobs.',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  }
];

// Popular locations
const POPULAR_LOCATIONS = [
  { id: 'loc1', name: 'Downtown', distance: 2.5 },
  { id: 'loc2', name: 'Airport', distance: 15.8 },
  { id: 'loc3', name: 'Shopping Mall', distance: 5.3 },
  { id: 'loc4', name: 'Business District', distance: 3.7 },
  { id: 'loc5', name: 'University', distance: 8.2 },
];

// Professional categories
const PROFESSIONAL_CATEGORIES = [
  { id: 'driver', name: 'Drivers', icon: <Car size={20} color={colors.primary} /> },
  { id: 'electrician', name: 'Electricians', icon: <Zap size={20} color={colors.primary} /> },
  { id: 'plumber', name: 'Plumbers', icon: <Wrench size={20} color={colors.primary} /> },
  { id: 'security', name: 'Security', icon: <Shield size={20} color={colors.primary} /> },
  { id: 'food', name: 'Food Service', icon: <Utensils size={20} color={colors.primary} /> },
  { id: 'construction', name: 'Construction', icon: <Construction size={20} color={colors.primary} /> },
  { id: 'carpenter', name: 'Carpenters', icon: <Hammer size={20} color={colors.primary} /> },
  { id: 'painter', name: 'Painters', icon: <Paintbrush size={20} color={colors.primary} /> },
  { id: 'it', name: 'IT Services', icon: <Laptop size={20} color={colors.primary} /> },
];

export default function DriversScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { drivers, fetchDrivers, isLoading } = useDriverStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<VehicleCategory[]>([]);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [maxDistance, setMaxDistance] = useState(30);
  const [ads, setAds] = useState(ADS);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Animation values
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  
  const vehicleCategories: VehicleCategory[] = ['Car', 'Truck', 'Bus', 'Van'];

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Animate search bar on mount
  useEffect(() => {
    Animated.timing(searchBarAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Only fetch drivers if authenticated
    if (isAuthenticated && user) {
      fetchDrivers();
    }
  }, [isAuthenticated, user, fetchDrivers]);

  // Don't render content until authentication is checked
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDrivers();
    setRefreshing(false);
  };

  const toggleCategory = (category: VehicleCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleAdClose = (adId: string) => {
    setAds(ads.filter(ad => ad.id !== adId));
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(selectedLocation === locationId ? null : locationId);
  };

  const handleProfessionSelect = (professionId: string) => {
    setSelectedProfession(selectedProfession === professionId ? null : professionId);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter drivers based on search query, selected categories, and distance
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      (driver.vehicleCategories && driver.vehicleCategories.some(category => selectedCategories.includes(category)));
    
    const matchesDistance = driver.distance && driver.distance <= maxDistance;
    
    // If a location is selected, filter by that location's distance
    const matchesLocation = !selectedLocation || 
      (driver.distance && POPULAR_LOCATIONS.find(loc => loc.id === selectedLocation)?.distance 
        ? driver.distance <= (POPULAR_LOCATIONS.find(loc => loc.id === selectedLocation)?.distance || 50)
        : true);
    
    // If a profession is selected, filter by that profession
    // This is a mock implementation since we don't have profession data in the driver model
    const matchesProfession = !selectedProfession || 
      (selectedProfession === 'driver' && driver.vehicleCategories && driver.vehicleCategories.length > 0);
    
    return matchesSearch && matchesCategory && matchesDistance && matchesLocation && matchesProfession;
  });

  const handleChatPress = (driver: Driver) => {
    if (isNavigationReady) {
      router.push(`/chat/${driver.id}`);
    }
  };

  const renderDriverCard = ({ item }: { item: Driver }) => (
    <DriverCard 
      driver={item} 
      onChatPress={() => handleChatPress(item)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<Users size={64} color={colors.textLight} />}
      title="No Professionals Found"
      message={
        searchQuery || selectedCategories.length > 0 || selectedProfession
          ? "No professionals match your search criteria. Try adjusting your filters."
          : "There are no professionals available at the moment."
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Animated.View 
          style={[
            styles.searchContainer,
            { 
              opacity: searchBarAnim,
              transform: [{ translateY: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              })}]
            }
          ]}
        >
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search professionals..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.placeholder}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={toggleFilters}
          >
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
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
        <View style={styles.professionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Browse by Profession</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.professionsGrid}>
            {PROFESSIONAL_CATEGORIES.slice(0, 6).map((profession) => (
              <TouchableOpacity
                key={profession.id}
                style={[
                  styles.professionItem,
                  selectedProfession === profession.id && styles.selectedProfessionItem
                ]}
                onPress={() => handleProfessionSelect(profession.id)}
                activeOpacity={0.7}
              >
                <View style={styles.professionIcon}>
                  {profession.icon}
                </View>
                <Text style={[
                  styles.professionName,
                  selectedProfession === profession.id && styles.selectedProfessionName
                ]}>
                  {profession.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.locationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Popular Locations</Text>
            <TouchableOpacity>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locationsContainer}
          >
            {POPULAR_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationItem,
                  selectedLocation === location.id && styles.selectedLocationItem
                ]}
                onPress={() => handleLocationSelect(location.id)}
                activeOpacity={0.7}
              >
                <MapPin size={14} color={selectedLocation === location.id ? colors.primary : colors.textLight} />
                <Text style={[
                  styles.locationName,
                  selectedLocation === location.id && styles.selectedLocationName
                ]}>
                  {location.name}
                </Text>
                <Text style={styles.locationDistance}>
                  {location.distance} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterHeader}>
              <Filter size={16} color={colors.textLight} />
              <Text style={styles.filterTitle}>Filter by distance:</Text>
            </View>
            
            <DistanceSlider
              value={maxDistance}
              onValueChange={setMaxDistance}
              maximumValue={50}
            />
            
            <View style={styles.filterHeader}>
              <Car size={16} color={colors.textLight} />
              <Text style={styles.filterTitle}>Filter by vehicle type:</Text>
            </View>
            
            <View style={styles.categoriesContainer}>
              {vehicleCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category) && styles.selectedCategoryChip
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategories.includes(category) && styles.selectedCategoryText
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {ads.length > 0 && (
          <View style={styles.adsContainer}>
            {ads.map(ad => (
              <AdCard
                key={ad.id}
                title={ad.title}
                description={ad.description}
                imageUrl={ad.imageUrl}
                onClose={() => handleAdClose(ad.id)}
                onPress={() => alert(`You clicked on: ${ad.title}`)}
              />
            ))}
          </View>
        )}
        
        <View style={styles.professionalsSection}>
          <Text style={styles.professionalsTitle}>
            {filteredDrivers.length} Professionals Found
          </Text>
          
          <View style={styles.professionalsContainer}>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map(driver => (
                <DriverCard 
                  key={driver.id}
                  driver={driver} 
                  onChatPress={() => handleChatPress(driver)}
                />
              ))
            ) : (
              renderEmptyState()
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionsSection: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  professionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  professionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 16,
    width: '31%',
    marginBottom: 12,
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
  selectedProfessionItem: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  professionIcon: {
    marginBottom: 8,
  },
  professionName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  selectedProfessionName: {
    color: colors.primary,
    fontWeight: '600',
  },
  locationsSection: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  locationsContainer: {
    paddingBottom: 8,
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedLocationItem: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
    marginRight: 4,
  },
  selectedLocationName: {
    color: colors.primary,
  },
  locationDistance: {
    fontSize: 10,
    color: colors.textLight,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryChip: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.primary,
    fontWeight: '500',
  },
  adsContainer: {
    padding: 16,
  },
  professionalsSection: {
    padding: 16,
  },
  professionalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  professionalsContainer: {
    gap: 16,
  },
});