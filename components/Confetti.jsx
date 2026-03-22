import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence, Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FB5', '#C780FA', '#45CFDD', '#FFB347', '#87CEEB', '#DDA0DD'];

const ConfettiPiece = ({ index, total }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  const startX = (index / total) * width + (Math.random() - 0.5) * 80;
  const color = COLORS[index % COLORS.length];
  const size = 6 + Math.random() * 10;
  const shape = index % 4; // 0: circle, 1: rect, 2: diamond, 3: star-like
  const delay = Math.random() * 800;
  const duration = 2500 + Math.random() * 2000;

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 250 }));
    translateY.value = withDelay(delay, withTiming(height + 100, { duration, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withSequence(
      withTiming((Math.random() - 0.5) * 150, { duration: 800 }),
      withTiming((Math.random() - 0.5) * 250, { duration: 1200 }),
      withTiming((Math.random() - 0.5) * 100, { duration: 1000 }),
    ));
    rotate.value = withDelay(delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3), { duration: duration + 500 }));
    opacity.value = withDelay(delay + duration * 0.7, withTiming(0, { duration: 800 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const getShapeStyle = () => {
    switch (shape) {
      case 0: // circle
        return { width: size, height: size, borderRadius: size / 2 };
      case 1: // rectangle
        return { width: size, height: size * 2.5, borderRadius: 2 };
      case 2: // diamond (rotated square)
        return { width: size, height: size, borderRadius: 2, transform: [{ rotate: '45deg' }] };
      case 3: // small star-like
        return { width: size * 0.8, height: size * 2, borderRadius: size * 0.4 };
      default:
        return { width: size, height: size, borderRadius: size / 2 };
    }
  };

  return (
    <Animated.View style={[{
      position: 'absolute',
      left: startX,
      top: -20,
      backgroundColor: color,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
      ...getShapeStyle(),
    }, animStyle]} />
  );
};

export default function Confetti({ count = 40 }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} index={i} total={count} />
      ))}
    </View>
  );
}
