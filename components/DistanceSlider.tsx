import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface DistanceSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
}

export const DistanceSlider: React.FC<DistanceSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 50,
  step = 1
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <MapPin size={16} color={colors.textLight} />
        <Text style={styles.label}>Maximum distance: <Text style={styles.valueText}>{value} km</Text></Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={value}
          onValueChange={onValueChange}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>{minimumValue} km</Text>
          <Text style={styles.rangeLabel}>{maximumValue} km</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  valueText: {
    fontWeight: '600',
    color: colors.primary,
  },
  sliderContainer: {
    marginTop: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  rangeLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
});