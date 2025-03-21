import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Animated
} from 'react-native';
import { 
  User, 
  Phone, 
  Camera, 
  X,
  FileCheck,
  Building2,
  Tool,
  Briefcase,
  Car,
  Truck,
  Bus,
  Zap,
  Wrench,
  Shield
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { VehicleCategory } from '@/types/driver';

interface ProfileEditFormProps {
  initialData: {
    name: string;
    phone: string;
    profilePicture?: string;
    governmentId?: string;
    vehicleCategories?: VehicleCategory[];
    skills?: string[];
    isIndianGovernment?: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  initialData,
  onSubmit,
  onCancel
}) => {
  const [name, setName] = useState(initialData.name || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [governmentId, setGovernmentId] = useState(initialData.governmentId || '');
  const [isIndianGovernment, setIsIndianGovernment] = useState(initialData.isIndianGovernment || false);
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleCategory[]>(
    initialData.vehicleCategories || []
  );
  const [skills, setSkills] = useState<string[]>(
    initialData.skills || []
  );
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation values
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
  
  const skillOptions = [
    { id: 'driving', name: 'Driving', icon: <Car size={16} color={colors.textLight} /> },
    { id: 'electrical', name: 'Electrical', icon: <Zap size={16} color={colors.textLight} /> },
    { id: 'plumbing', name: 'Plumbing', icon: <Wrench size={16} color={colors.textLight} /> },
    { id: 'security', name: 'Security', icon: <Shield size={16} color={colors.textLight} /> },
    { id: 'management', name: 'Management', icon: <Briefcase size={16} color={colors.textLight} /> },
    { id: 'technical', name: 'Technical', icon: <Tool size={16} color={colors.textLight} /> },
  ];
  
  const validateForm = () => {
    if (!name) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    
    return true;
  };
  
  const toggleVehicleType = (type: VehicleCategory) => {
    if (selectedVehicles.includes(type)) {
      setSelectedVehicles(selectedVehicles.filter(t => t !== type));
    } else {
      setSelectedVehicles([...selectedVehicles, type]);
    }
  };
  
  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };
  
  const addCustomSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };
  
  const handleUploadPhoto = () => {
    Alert.alert('Upload Photo', 'This feature would allow you to upload a profile photo');
  };
  
  const handleUploadGovernmentId = () => {
    Alert.alert('Upload Government ID', 'This feature would allow you to upload your government ID for verification');
    setGovernmentId('ID-' + Math.floor(Math.random() * 1000000).toString());
  };
  
  const toggleIndianGovernment = () => {
    setIsIndianGovernment(!isIndianGovernment);
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const profileData = {
        name,
        phone,
        governmentId,
        vehicleCategories: selectedVehicles,
        skills,
        isIndianGovernment
      };
      
      await onSubmit(profileData);
      Alert.alert('Success', 'Profile updated successfully');
      onCancel();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <Image 
            source={{ 
              uri: initialData.profilePicture || 
                'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' 
            }} 
            style={styles.profileImage} 
          />
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUploadPhoto}
          >
            <Camera size={20} color={colors.card} />
            <Text style={styles.uploadButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          leftIcon={<User size={20} color={colors.textLight} />}
        />
        
        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Phone size={20} color={colors.textLight} />}
        />
        
        <View style={styles.governmentIdSection}>
          <Text style={styles.sectionTitle}>Government ID</Text>
          <Text style={styles.sectionSubtitle}>
            Upload your government ID for verification. This helps build trust with customers.
          </Text>
          
          {governmentId ? (
            <View style={styles.idContainer}>
              <FileCheck size={20} color={colors.success} />
              <Text style={styles.idText}>ID uploaded and pending verification</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadIdButton}
              onPress={handleUploadGovernmentId}
            >
              <Text style={styles.uploadIdText}>Upload Government ID</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.indianGovtButton,
              isIndianGovernment && styles.indianGovtButtonSelected
            ]}
            onPress={toggleIndianGovernment}
          >
            <Building2 size={20} color={isIndianGovernment ? colors.card : colors.primary} />
            <Text 
              style={[
                styles.indianGovtText,
                isIndianGovernment && styles.indianGovtTextSelected
              ]}
            >
              Government Employee
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Professional Skills</Text>
        <Text style={styles.sectionSubtitle}>
          Select your professional skills to help employers find you
        </Text>
        
        <View style={styles.skillsContainer}>
          {skillOptions.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.skillButton,
                skills.includes(skill.name) && styles.selectedSkill
              ]}
              onPress={() => toggleSkill(skill.name)}
            >
              {skill.icon}
              <Text 
                style={[
                  styles.skillText,
                  skills.includes(skill.name) && styles.selectedSkillText
                ]}
              >
                {skill.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.customSkillContainer}>
          <Input
            label="Add Custom Skill"
            placeholder="Enter a skill"
            value={newSkill}
            onChangeText={setNewSkill}
            leftIcon={<Tool size={20} color={colors.textLight} />}
          />
          <TouchableOpacity 
            style={styles.addSkillButton}
            onPress={addCustomSkill}
            disabled={!newSkill}
          >
            <Text style={styles.addSkillText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Vehicle Types</Text>
        <Text style={styles.sectionSubtitle}>
          Select the types of vehicles you can drive
        </Text>
        
        <View style={styles.vehiclesContainer}>
          {vehicleTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.vehicleButton,
                selectedVehicles.includes(type) && styles.selectedVehicle
              ]}
              onPress={() => toggleVehicleType(type)}
            >
              <Text 
                style={[
                  styles.vehicleText,
                  selectedVehicles.includes(type) && styles.selectedVehicleText
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
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
            title="Save Changes"
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.border,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  governmentIdSection: {
    marginVertical: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  idText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  uploadIdButton: {
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadIdText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  indianGovtButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  indianGovtButtonSelected: {
    backgroundColor: colors.primary,
  },
  indianGovtText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  indianGovtTextSelected: {
    color: colors.card,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  skillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedSkill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
  },
  selectedSkillText: {
    color: colors.card,
    fontWeight: '500',
  },
  customSkillContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  addSkillButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 4,
  },
  addSkillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  vehiclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  vehicleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedVehicle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  vehicleText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedVehicleText: {
    color: colors.card,
    fontWeight: '500',
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