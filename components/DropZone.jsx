import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function DropZone({ id, activeZoneId, children, style }) {
  const isHighlighted = activeZoneId === id;

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isHighlighted ? 'rgba(74, 222, 128, 0.3)' : 'transparent',
    borderColor: isHighlighted ? 'rgba(74, 222, 128, 0.8)' : 'transparent',
    borderWidth: 2,
    transform: [
      { scale: withSpring(isHighlighted ? 1.05 : 1) }
    ]
  }));

  return (
    <Animated.View style={[animatedStyle, styles.zone, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  zone: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
