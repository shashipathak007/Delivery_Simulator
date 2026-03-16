import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence, Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FB5', '#C780FA', '#45CFDD'];

const ConfettiPiece = ({ index, total }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  const startX = (index / total) * width + (Math.random() - 0.5) * 60;
  const color = COLORS[index % COLORS.length];
  const size = 8 + Math.random() * 8;
  const isCircle = index % 3 === 0;
  const delay = Math.random() * 600;

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(delay, withTiming(height + 100, { duration: 2500 + Math.random() * 1500, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withSequence(
      withTiming((Math.random() - 0.5) * 120, { duration: 800 }),
      withTiming((Math.random() - 0.5) * 200, { duration: 1200 }),
      withTiming((Math.random() - 0.5) * 80, { duration: 800 }),
    ));
    rotate.value = withDelay(delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 3, { duration: 3000 }));
    opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 800 }));
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

  return (
    <Animated.View style={[{
      position: 'absolute',
      left: startX,
      top: -20,
      width: size,
      height: isCircle ? size : size * 2,
      borderRadius: isCircle ? size / 2 : 2,
      backgroundColor: color,
    }, animStyle]} />
  );
};

export default function Confetti({ count = 30 }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} index={i} total={count} />
      ))}
    </View>
  );
}
