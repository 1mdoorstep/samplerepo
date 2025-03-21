import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated
} from 'react-native';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase,
  Car,
  Truck,
  Bus,
  Building2,
  Building,
  Package,
  ShoppingBag,
  Zap,
  Wrench,
  Tool,
  Shield,
  Utensils,
  Construction,
  Hammer,
  Paintbrush,
  Laptop,
  Wifi,
  Leaf,
  Heart,
  Stethoscope
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { Job, JobType, JobCategory } from '@/types/job';
import { VehicleCategory } from '@/types/driver';

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  onApply?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onPress,
  onApply
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate card press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onPress) onPress();
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJobTypeIcon = (jobType: JobType) => {
    switch(jobType) {
      case 'Personal':
        return <Briefcase size={16} color={colors.textLight} />;
      case 'Commercial':
        return <Building size={16} color={colors.textLight} />;
      case 'Government':
        return <Building2 size={16} color={colors.primary} />;
      default:
        return <Briefcase size={16} color={colors.textLight} />;
    }
  };

  const getJobCategoryIcon = (category?: JobCategory) => {
    if (!category) return <Briefcase size={16} color={colors.textLight} />;
    
    switch(category) {
      case 'Rideshare':
        return <Car size={16} color={colors.textLight} />;
      case 'Delivery':
        return <Package size={16} color={colors.textLight} />;
      case 'Logistics':
        return <Truck size={16} color={colors.textLight} />;
      case 'Shopping':
        return <ShoppingBag size={16} color={colors.textLight} />;
      case 'Electrician':
        return <Zap size={16} color={colors.textLight} />;
      case 'Plumbing':
        return <Wrench size={16} color={colors.textLight} />;
      case 'Security':
        return <Shield size={16} color={colors.textLight} />;
      case 'Food':
        return <Utensils size={16} color={colors.textLight} />;
      case 'Construction':
        return <Construction size={16} color={colors.textLight} />;
      case 'Carpentry':
        return <Hammer size={16} color={colors.textLight} />;
      case 'Painting':
        return <Paintbrush size={16} color={colors.textLight} />;
      case 'IT':
        return <Laptop size={16} color={colors.textLight} />;
      case 'Networking':
        return <Wifi size={16} color={colors.textLight} />;
      case 'Gardening':
        return <Leaf size={16} color={colors.textLight} />;
      case 'Healthcare':
        return <Stethoscope size={16} color={colors.textLight} />;
      case 'Caregiving':
        return <Heart size={16} color={colors.textLight} />;
      default:
        return <Briefcase size={16} color={colors.textLight} />;
    }
  };

  const getVehicleIcon = (vehicleType: VehicleCategory) => {
    switch(vehicleType) {
      case 'Car':
        return <Car size={16} color={colors.textLight} />;
      case 'Truck':
        return <Truck size={16} color={colors.textLight} />;
      case 'Bus':
      case 'Van':
        return <Bus size={16} color={colors.textLight} />;
      default:
        return <Car size={16} color={colors.textLight} />;
    }
  };

  const getStatusColor = () => {
    switch(job.status) {
      case 'Open':
        return colors.success;
      case 'Assigned':
        return colors.primary;
      case 'Completed':
        return colors.textLight;
      case 'Cancelled':
        return colors.danger;
      default:
        return colors.textLight;
    }
  };

  // Check if job is in high demand
  const isHighDemand = job.applicationsCount && job.applicationsCount > 3;

  // Check if job is surging
  const isSurging = job.isSurging || (job.fare && job.fare > 50);

  return (
    <Animated.View 
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity 
        style={styles.container} 
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {isSurging && (
          <View style={styles.surgeBadge}>
            <Zap size={12} color="#fff" />
            <Text style={styles.surgeText}>Surge Pricing</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <Text style={styles.title}>{job.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{job.status}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
        
        <View style={styles.detailsContainer}>
          {job.category && (
            <View style={styles.detailRow}>
              {getJobCategoryIcon(job.category)}
              <Text style={styles.detailText}>{job.category}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            {getJobTypeIcon(job.jobType)}
            <Text style={styles.detailText}>{job.jobType}</Text>
          </View>
          
          <View style={styles.detailRow}>
            {getVehicleIcon(job.vehicleRequired)}
            <Text style={styles.detailText}>{job.vehicleRequired} required</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textLight} />
            <Text style={styles.detailText} numberOfLines={1}>{job.location.address}</Text>
          </View>
          
          {job.duration && (
            <View style={styles.detailRow}>
              <Clock size={16} color={colors.textLight} />
              <Text style={styles.detailText}>{job.duration}</Text>
            </View>
          )}
          
          {job.fare && (
            <View style={styles.fareRow}>
              <DollarSign size={16} color={isSurging ? colors.warning : colors.textLight} />
              <Text style={[
                styles.fareText, 
                isSurging && styles.surgeFareText
              ]}>
                ${job.fare}
                {isSurging && " (Surge)"}
              </Text>
            </View>
          )}
        </View>
        
        {job.companyName && (
          <View style={styles.companyContainer}>
            <Text style={styles.companyLabel}>Posted by:</Text>
            <Text style={styles.companyName}>{job.companyName}</Text>
          </View>
        )}
        
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
          style={styles.footerGradient}
        >
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.postedText}>Posted: {formatDate(job.postedAt)}</Text>
              
              {job.applicationsCount && job.applicationsCount > 0 && (
                <Text style={styles.applicationsText}>
                  {job.applicationsCount} applications
                </Text>
              )}
            </View>
            
            {job.status === 'Open' && onApply && (
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={onApply}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
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
  surgeBadge: {
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
  surgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
    marginLeft: 8,
  },
  surgeFareText: {
    color: colors.warning,
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  companyLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 4,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  footerGradient: {
    paddingTop: 20,
    paddingBottom: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  footerLeft: {
    flex: 1,
  },
  postedText: {
    fontSize: 12,
    color: colors.textLight,
  },
  applicationsText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
});