import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Platform,
  Animated,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare,
  Car,
  Truck,
  Bus,
  Shield,
  Zap,
  Briefcase,
  Tool,
  Wrench,
  ShieldCheck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { Driver, VehicleCategory } from '@/types/driver';

interface DriverCardProps {
  driver: Driver;
  onCallPress?: () => void;
  onChatPress?: () => void;
}

export const DriverCard: React.FC<DriverCardProps> = ({ 
  driver, 
  onCallPress, 
  onChatPress 
}) => {
  const router = useRouter();
  const animatedScale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.98,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = () => {
    router.push(`/driver/${driver.id}`);
  };

  const handleCallPress = () => {
    if (onCallPress) {
      onCallPress();
    }
  };

  const handleChatPress = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      router.push(`/chat/${driver.id}`);
    }
  };

  // Calculate time remaining for availability
  const getTimeRemaining = () => {
    if (!driver.currentAvailability) return null;
    
    const endTime = new Date(driver.currentAvailability.endTime);
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };

  const timeRemaining = getTimeRemaining();

  // Check if professional is in high demand
  const isHighDemand = driver.totalRides > 50 && driver.rating > 4.5;

  // Safely render skill/vehicle icons
  const renderSkillIcons = () => {
    if (!driver.vehicleCategories || driver.vehicleCategories.length === 0) {
      return null;
    }

    return (
      <View style={styles.skillsContainer}>
        {driver.vehicleCategories.map((category, index) => {
          let SkillIcon;
          
          switch(category) {
            case 'Car':
              SkillIcon = Car;
              break;
            case 'Truck':
              SkillIcon = Truck;
              break;
            case 'Bus':
            case 'Van':
              SkillIcon = Bus;
              break;
            default:
              SkillIcon = Briefcase;
          }
          
          return (
            <View key={index} style={styles.skillItem}>
              <SkillIcon size={14} color={colors.textLight} />
              <Text style={styles.skillText}>{category}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Render professional skills
  const renderProfessionalSkills = () => {
    if (!driver.skills || driver.skills.length === 0) {
      return null;
    }

    return (
      <View style={styles.skillsContainer}>
        {driver.skills.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <Tool size={14} color={colors.textLight} />
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Pressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleCardPress}
    >
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ scale: animatedScale }] }
        ]}
      >
        {isHighDemand && (
          <View style={styles.highDemandBadge}>
            <Zap size={12} color="#fff" />
            <Text style={styles.highDemandText}>High Demand</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: driver.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }} 
              style={styles.avatar} 
            />
            {driver.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{driver.name}</Text>
              {driver.governmentIdVerified && (
                <ShieldCheck size={14} color={colors.success} />
              )}
            </View>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.warning} fill={colors.warning} />
              <Text style={styles.rating}>{driver.rating.toFixed(1)}</Text>
              <Text style={styles.rides}>({driver.totalRides} jobs)</Text>
            </View>
            
            {driver.recentHires > 0 && (
              <Text style={styles.recentHires}>
                {driver.recentHires}+ hired in last hour
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={styles.infoText}>{driver.distance} km away</Text>
          </View>
          
          {renderSkillIcons()}
          {renderProfessionalSkills()}
          
          {driver.governmentIdVerified && (
            <View style={styles.verifiedContainer}>
              <Text style={styles.verifiedText}>✓ ID Verified</Text>
            </View>
          )}
          
          {driver.isIndianGovernment && (
            <View style={styles.govtContainer}>
              <Text style={styles.govtText}>🏛️ Government Employee</Text>
            </View>
          )}
          
          {timeRemaining && (
            <View style={styles.availabilityContainer}>
              <View style={styles.availabilityDot} />
              <Text style={styles.availabilityText}>Available</Text>
              <Text style={styles.timeRemaining}>{timeRemaining}</Text>
            </View>
          )}
        </View>

        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
          style={styles.actionsGradient}
        >
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                !driver.allowCalls && styles.disabledActionButton
              ]} 
              onPress={handleCallPress}
              disabled={!driver.allowCalls}
              activeOpacity={0.7}
            >
              <Phone size={20} color={driver.allowCalls ? colors.primary : colors.disabled} />
              <Text style={[
                styles.actionText,
                !driver.allowCalls && styles.disabledActionText
              ]}>
                {driver.allowCalls ? "Call" : "Calls disabled"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleChatPress}
              activeOpacity={0.7}
            >
              <MessageSquare size={20} color={colors.primary} />
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      }
    }),
  },
  highDemandBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  highDemandText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  rides: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  recentHires: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  verifiedContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  govtContainer: {
    backgroundColor: 'rgba(64, 156, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  govtText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
    marginRight: 8,
  },
  timeRemaining: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionsGradient: {
    paddingTop: 20,
    paddingBottom: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  disabledActionButton: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  disabledActionText: {
    color: colors.disabled,
  },
});