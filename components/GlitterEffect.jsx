import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withRepeat, withSequence, Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SPARKLE_COLORS = ['#FFD700', '#FFFACD', '#FFF8DC', '#FAFAD2', '#FFE4B5', '#FFFFFF', '#F0E68C', '#EEE8AA'];

const Sparkle = ({ index, total }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);

  const startX = Math.random() * width;
  const startY = Math.random() * height * 0.7 + height * 0.1;
  const color = SPARKLE_COLORS[index % SPARKLE_COLORS.length];
  const size = 4 + Math.random() * 8;
  const delay = Math.random() * 2000;
  const duration = 600 + Math.random() * 800;

  useEffect(() => {
    // Sparkle in and out repeatedly
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: duration * 0.3, easing: Easing.out(Easing.ease) }),
        withTiming(0.2, { duration: duration * 0.2 }),
        withTiming(1, { duration: duration * 0.2 }),
        withTiming(0, { duration: duration * 0.3, easing: Easing.in(Easing.ease) }),
        withTiming(0, { duration: 300 + Math.random() * 500 }), // pause between sparkles
      ),
      -1,
      false
    ));

    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1.2, { duration: duration * 0.3 }),
        withTiming(0.8, { duration: duration * 0.2 }),
        withTiming(1.5, { duration: duration * 0.2 }),
        withTiming(0, { duration: duration * 0.3 }),
        withTiming(0, { duration: 300 + Math.random() * 500 }),
      ),
      -1,
      false
    ));

    translateY.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(-15 - Math.random() * 20, { duration: duration }),
        withTiming(0, { duration: 100 }),
      ),
      -1,
      false
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: '45deg' },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{
      position: 'absolute',
      left: startX,
      top: startY,
      width: size,
      height: size,
    }, animStyle]}>
      {/* Star/sparkle shape using two overlapping rotated squares */}
      <View style={{
        position: 'absolute',
        width: size,
        height: size * 0.3,
        backgroundColor: color,
        borderRadius: size * 0.15,
        top: size * 0.35,
        left: 0,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      }} />
      <View style={{
        position: 'absolute',
        width: size * 0.3,
        height: size,
        backgroundColor: color,
        borderRadius: size * 0.15,
        top: 0,
        left: size * 0.35,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      }} />
    </Animated.View>
  );
};

export default function GlitterEffect({ count = 35 }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Sparkle key={i} index={i} total={count} />
      ))}
    </View>
  );
}
