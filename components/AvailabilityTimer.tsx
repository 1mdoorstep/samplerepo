import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface AvailabilityTimerProps {
  endTime: string;
}

export const AvailabilityTimer: React.FC<AvailabilityTimerProps> = ({
  endTime
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endTime);
      const now = new Date();
      const diffMs = end.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }
      
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
    };
    
    calculateTimeRemaining();
    
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <View style={[
      styles.container,
      isExpired && styles.expiredContainer
    ]}>
      <Clock size={14} color={isExpired ? colors.danger : colors.success} />
      <Text style={[
        styles.timerText,
        isExpired && styles.expiredText
      ]}>
        {timeRemaining}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)', // iOS green with opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expiredContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // iOS red with opacity
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  expiredText: {
    color: colors.danger,
  },
});