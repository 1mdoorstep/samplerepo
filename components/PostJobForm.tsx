import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform,
  Animated
} from 'react-native';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  X,
  Building2,
  Briefcase,
  Building,
  Car,
  Truck,
  Bus,
  Package,
  ShoppingBag,
  Zap,
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
  Stethoscope
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { VehicleCategory } from '@/types/driver';
import { JobType, JobCategory } from '@/types/job';

interface PostJobFormProps {
  onSubmit: (jobData: any) => Promise<void>;
  onCancel: () => void;
}

export const PostJobForm: React.FC<PostJobFormProps> = ({ 
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [fare, setFare] = useState('');
  const [duration, setDuration] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory>('Car');
  const [selectedJobType, setSelectedJobType] = useState<JobType>('Personal');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('Rideshare');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation refs
  const formScaleAnim = useRef(new Animated.Value(0.95)).current;
  const formOpacityAnim = useRef(new Animated.Value(0)).current;
  const formRef = useRef(null);
  
  // Animate form entry
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(formScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const vehicleTypes: VehicleCategory[] = ['Car', 'Truck', 'Bus', 'Van'];
  const jobTypes: JobType[] = ['Personal', 'Commercial', 'Government'];
  
  // Extended job categories
  const jobCategories: { id: JobCategory; name: string; icon: React.ReactNode }[] = [
    { id: 'Rideshare', name: 'Rideshare', icon: <Car size={20} color={selectedCategory === 'Rideshare' ? colors.card : colors.textLight} /> },
    { id: 'Delivery', name: 'Delivery', icon: <Package size={20} color={selectedCategory === 'Delivery' ? colors.card : colors.textLight} /> },
    { id: 'Logistics', name: 'Logistics', icon: <Truck size={20} color={selectedCategory === 'Logistics' ? colors.card : colors.textLight} /> },
    { id: 'Personal', name: 'Personal', icon: <Briefcase size={20} color={selectedCategory === 'Personal' ? colors.card : colors.textLight} /> },
    { id: 'Commercial', name: 'Commercial', icon: <Building size={20} color={selectedCategory === 'Commercial' ? colors.card : colors.textLight} /> },
    { id: 'Shopping', name: 'Shopping', icon: <ShoppingBag size={20} color={selectedCategory === 'Shopping' ? colors.card : colors.textLight} /> },
    { id: 'Electrician', name: 'Electrician', icon: <Zap size={20} color={selectedCategory === 'Electrician' ? colors.card : colors.textLight} /> },
    { id: 'Plumbing', name: 'Plumbing', icon: <Wrench size={20} color={selectedCategory === 'Plumbing' ? colors.card : colors.textLight} /> },
    { id: 'Security', name: 'Security', icon: <Shield size={20} color={selectedCategory === 'Security' ? colors.card : colors.textLight} /> },
    { id: 'Food', name: 'Food Service', icon: <Utensils size={20} color={selectedCategory === 'Food' ? colors.card : colors.textLight} /> },
    { id: 'Construction', name: 'Construction', icon: <Construction size={20} color={selectedCategory === 'Construction' ? colors.card : colors.textLight} /> },
    { id: 'Carpentry', name: 'Carpentry', icon: <Hammer size={20} color={selectedCategory === 'Carpentry' ? colors.card : colors.textLight} /> },
    { id: 'Painting', name: 'Painting', icon: <Paintbrush size={20} color={selectedCategory === 'Painting' ? colors.card : colors.textLight} /> },
    { id: 'IT', name: 'IT Services', icon: <Laptop size={20} color={selectedCategory === 'IT' ? colors.card : colors.textLight} /> },
    { id: 'Networking', name: 'Networking', icon: <Wifi size={20} color={selectedCategory === 'Networking' ? colors.card : colors.textLight} /> },
    { id: 'Gardening', name: 'Gardening', icon: <Leaf size={20} color={selectedCategory === 'Gardening' ? colors.card : colors.textLight} /> },
    { id: 'Healthcare', name: 'Healthcare', icon: <Stethoscope size={20} color={selectedCategory === 'Healthcare' ? colors.card : colors.textLight} /> },
    { id: 'Caregiving', name: 'Caregiving', icon: <Heart size={20} color={selectedCategory === 'Caregiving' ? colors.card : colors.textLight} /> },
  ];
  
  const validateForm = () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a job title');
      return false;
    }
    
    if (!description) {
      Alert.alert('Error', 'Please enter a job description');
      return false;
    }
    
    if (!location) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }
    
    return true;
  };
  
  const getJobTypeIcon = (type: JobType) => {
    switch(type) {
      case 'Personal':
        return <Briefcase size={20} color={selectedJobType === type ? colors.card : colors.textLight} />;
      case 'Commercial':
        return <Building size={20} color={selectedJobType === type ? colors.card : colors.textLight} />;
      case 'Government':
        return <Building2 size={20} color={selectedJobType === type ? colors.card : colors.textLight} />;
      default:
        return null;
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate expiry date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const jobData = {
        userId: 'user-1', // Current user ID
        title,
        description,
        vehicleRequired: selectedVehicle,
        jobType: selectedJobType,
        category: selectedCategory,
        companyName: companyName || undefined,
        companyId: companyName ? 'comp-' + Math.floor(Math.random() * 1000) : undefined,
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: location
        },
        fare: fare ? parseFloat(fare) : undefined,
        duration: duration || undefined,
        expiresAt: expiresAt.toISOString(),
        isSurging: Math.random() > 0.7, // Random surge for demo
        applicationsCount: Math.floor(Math.random() * 5) // Random applications for demo
      };
      
      await onSubmit(jobData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setFare('');
      setDuration('');
      setCompanyName('');
      setSelectedVehicle('Car');
      setSelectedJobType('Personal');
      setSelectedCategory('Rideshare');
      
      Alert.alert('Success', 'Job posted successfully');
      onCancel();
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: formOpacityAnim,
          transform: [{ scale: formScaleAnim }]
        }
      ]}
      ref={formRef}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Post a New Job</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Input
          label="Job Title"
          placeholder="Enter job title"
          value={title}
          onChangeText={setTitle}
        />
        
        <Input
          label="Description"
          placeholder="Describe the job requirements"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        
        <Input
          label="Location"
          placeholder="Enter job location"
          value={location}
          onChangeText={setLocation}
          leftIcon={<MapPin size={20} color={colors.textLight} />}
        />
        
        <Input
          label="Fare (optional)"
          placeholder="Enter fare amount"
          value={fare}
          onChangeText={setFare}
          keyboardType="numeric"
          leftIcon={<DollarSign size={20} color={colors.textLight} />}
        />
        
        <Input
          label="Duration (optional)"
          placeholder="e.g. 2 hours, 1 day"
          value={duration}
          onChangeText={setDuration}
          leftIcon={<Clock size={20} color={colors.textLight} />}
        />
        
        <Input
          label="Company Name (optional)"
          placeholder="Enter company name if applicable"
          value={companyName}
          onChangeText={setCompanyName}
          leftIcon={<Building size={20} color={colors.textLight} />}
        />
        
        <Text style={styles.sectionTitle}>Job Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContainer}
        >
          {jobCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.selectedCategoryButtonText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={styles.sectionTitle}>Job Type</Text>
        <View style={styles.jobTypesContainer}>
          {jobTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.jobTypeButton,
                selectedJobType === type && styles.selectedJobType
              ]}
              onPress={() => setSelectedJobType(type)}
            >
              {getJobTypeIcon(type)}
              <Text 
                style={[
                  styles.jobTypeText,
                  selectedJobType === type && styles.selectedJobTypeText
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Vehicle Type Required</Text>
        <View style={styles.optionsContainer}>
          {vehicleTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                selectedVehicle === type && styles.selectedOption
              ]}
              onPress={() => setSelectedVehicle(type)}
            >
              <Text 
                style={[
                  styles.optionText,
                  selectedVehicle === type && styles.selectedOptionText
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.expiryNote}>
          <Calendar size={16} color={colors.textLight} />
          <Text style={styles.expiryText}>
            Job will be visible for 24 hours after posting
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            type="outline"
            size="medium"
            style={styles.cancelButton}
          />
          <Button
            title="Post Job"
            onPress={handleSubmit}
            type="primary"
            size="medium"
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  categoriesScrollContainer: {
    paddingBottom: 8,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
    width: 90,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedCategoryButtonText: {
    color: colors.card,
  },
  jobTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  jobTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedJobType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  jobTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginTop: 4,
  },
  selectedJobTypeText: {
    color: colors.card,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.card,
    fontWeight: '500',
  },
  expiryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  expiryText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});