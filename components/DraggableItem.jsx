import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function DraggableItem({ item, dropZones, onDrop, onProximity, isUsed, isLocked }) {
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragScale = useSharedValue(1);
  const idleOffsetY = useSharedValue(0);

  useEffect(() => {
    if (!isUsed && !isLocked) {
      idleOffsetY.value = withRepeat(
        withSequence(
          withSpring(-5),
          withSpring(0)
        ),
        -1,
        true
      );
    } else {
      idleOffsetY.value = 0;
    }
  }, [isUsed, isLocked]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onDropRef = React.useRef(onDrop);
  const onProximityRef = React.useRef(onProximity);

  useEffect(() => {
    onDropRef.current = onDrop;
    onProximityRef.current = onProximity;
  }, [onDrop, onProximity]);

  const checkProximity = (x, y) => {
    if (onProximityRef.current) {
      onProximityRef.current(item.id, x, y);
    }
  };

  const handleDrop = (x, y) => {
    if (onDropRef.current) {
      const isValid = onDropRef.current(item.id, x, y);
      if (!isValid) {
        dragX.value = withSpring(0);
        dragY.value = withSpring(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        dragX.value = withSpring(0);
        dragY.value = withSpring(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!isUsed && !isLocked)
    .onBegin(() => {
      isDragging.value = true;
      dragScale.value = withSpring(1.2);
      runOnJS(triggerHaptic)();
    })
    .onUpdate((e) => {
      dragX.value = e.translationX;
      dragY.value = e.translationY;
      runOnJS(checkProximity)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      dragScale.value = withSpring(1);
      isDragging.value = false;
      runOnJS(handleDrop)(e.absoluteX, e.absoluteY);
    });

  const itemStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value + (isDragging.value ? 0 : idleOffsetY.value) },
      { scale: dragScale.value }
    ],
    zIndex: isDragging.value ? 999 : 1,
    opacity: isUsed ? 0.5 : isLocked ? 0.3 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[itemStyle, styles.container]} className="items-center justify-center p-2 mb-2">
        <View className="bg-white rounded-2xl w-16 h-16 items-center justify-center shadow-md border border-gray-100">
          {item.type === 'image' ? (
            <Image 
              source={item.icon} 
              style={{ width: 40, height: 40 }} 
              resizeMode="contain" 
            />
          ) : (
            <Text className="text-3xl">{item.icon}</Text>
          )}
          
          {isUsed && (
            <View className="absolute inset-0 bg-black/10 rounded-2xl items-center justify-center">
              <Text className="text-2xl">✅</Text>
            </View>
          )}
          {isLocked && (
            <View className="absolute inset-0 bg-black/10 rounded-2xl items-center justify-center">
              <Text className="text-xl">🔒</Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-600 mt-1 font-medium">{item.name}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    // ensures the item can be measured nicely
  }
});
