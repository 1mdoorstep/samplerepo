import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated
} from 'react-native';
import { colors } from '@/constants/colors';

interface ModeSwitchProps {
  isDriverMode: boolean;
  onToggle: () => void;
}

export const ModeSwitch: React.FC<ModeSwitchProps> = ({
  isDriverMode,
  onToggle
}) => {
  // Animation values
  const translateX = useRef(new Animated.Value(isDriverMode ? 1 : 0)).current;
  
  // Update animation when isDriverMode changes
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isDriverMode ? 1 : 0,
      friction: 8,
      tension: 50,
      useNativeDriver: false, // We need to animate backgroundColor which isn't supported by native driver
    }).start();
  }, [isDriverMode, translateX]);
  
  // Interpolate values for animations
  const leftTextOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });
  
  const rightTextOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  
  const indicatorTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 78], // Adjust based on your container width
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.activeIndicator,
          {
            transform: [{ translateX: indicatorTranslateX }],
          }
        ]}
      />
      
      <TouchableOpacity
        style={styles.option}
        onPress={() => isDriverMode && onToggle()}
        activeOpacity={0.7}
      >
        <Animated.Text
          style={[
            styles.optionText,
            { opacity: leftTextOpacity }
          ]}
        >
          Hire
        </Animated.Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.option}
        onPress={() => !isDriverMode && onToggle()}
        activeOpacity={0.7}
      >
        <Animated.Text
          style={[
            styles.optionText,
            { opacity: rightTextOpacity }
          ]}
        >
          Get Hired
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    borderRadius: 20,
    padding: 2,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    bottom: 2,
    width: 76,
    backgroundColor: colors.primary,
    borderRadius: 18,
    zIndex: 0,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    zIndex: 1,
    width: 80,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.card,
  },
});