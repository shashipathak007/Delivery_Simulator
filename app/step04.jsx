import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, StatusBar, Dimensions } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, ZoomIn, SlideInUp, BounceIn,
  useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming, withRepeat
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


import GameStep from '../components/GameStep';
import StepHeader from '../components/StepHeader';
import Confetti from '../components/Confetti';
import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';

const { width, height } = Dimensions.get('window');

const ITEMS_TO_COLLECT = [
  { id: '1', name: 'Plastic Sheet', source: require('../assets/images/plastic.png') },
  { id: '2', name: '3/4 Towels', source: require('../assets/images/towel.png') },
  { id: '3', name: 'Soap', source: require('../assets/images/soap.png') },
  { id: '4', name: 'Scissors', source: require('../assets/images/scissors.png') },
  { id: '5', name: 'String', source: require('../assets/images/string.jpg') },
  { id: '6', name: 'Blanket', source: require('../assets/images/blanket.png') },
  { id: '7', name: 'Water', source: require('../assets/images/warm_bowl.png') },
  { id: '8', name: 'Gloves', source: require('../assets/images/gloves.png') }
];

const positions = ITEMS_TO_COLLECT.map((_, i) => ({
  top: 120 + Math.random() * (height * 0.3),
  left: 20 + Math.random() * (width - 100),
}));

const PulsingIndicator = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.3, { duration: 1000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.1, { duration: 1000 }), -1, true);
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return (
    <View style={{ position: 'absolute', top: -30, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.4)' }, animStyle]} />
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' }} />
      </View>
    </View>
  );
};

function DraggableCollectable({ item, initialPos, onCollect }) {
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const checkDrop = (x, y) => {
    if (y > height - 350) { onCollect(item); } else { dragX.value = withSpring(0); dragY.value = withSpring(0); }
  };
  const panGesture = Gesture.Pan()
    .onBegin(() => { isDragging.value = true; try { runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light); } catch (e) { } })
    .onUpdate((e) => { dragX.value = e.translationX; dragY.value = e.translationY; })
    .onEnd((e) => { isDragging.value = false; runOnJS(checkDrop)(e.absoluteX, e.absoluteY); });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { translateY: dragY.value }, { scale: isDragging.value ? 1.2 : 1 }],
    zIndex: isDragging.value ? 999 : 1
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top: initialPos.top, left: initialPos.left }, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={item.source} style={{ width: 45, height: 45 }} resizeMode="contain" />
          <Text style={{ marginTop: 6, fontSize: 10, fontWeight: '900', color: '#111827', textAlign: 'center' }}>
            {item.name}
          </Text>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function Step04() {
  const { addScore, score, markStepComplete } = useGame();
  const { addToInventory } = useInventory();
  const [collectedItems, setCollectedItems] = useState([]);
  const isDone = collectedItems.length === ITEMS_TO_COLLECT.length;

  const handleCollect = (item) => {
    if (collectedItems.includes(item.id)) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setCollectedItems(prev => [...prev, item.id]);
    addToInventory({ ...item, type: 'image' });
    addScore(10);
  };

  useEffect(() => {
    if (isDone) {
      setTimeout(() => {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { }
        markStepComplete(4);
      }, 1500);
    }
  }, [isDone]);

  const scenes = [{ id: 'kit', image: require('../assets/images/Clean_Bed.jpg') }];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameStep
        step={4}
        score={score}
        scenes={scenes}
        sceneIndex={0}
        isDone={isDone}
        showConfetti={isDone}
        statusTitle="SUPPLIES READY"
        statusDetail="KIT SECURED"
      >
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }} pointerEvents="box-none">
          {ITEMS_TO_COLLECT.map((item, index) => {
            const isCollected = collectedItems.includes(item.id);
            return !isCollected && <DraggableCollectable key={item.id} item={item} initialPos={positions[index]} onCollect={handleCollect} />;
          })}
        </View>

        <View pointerEvents="none" style={{ flex: 1 }} />

        <Animated.View entering={SlideInUp.delay(300)} style={{ paddingHorizontal: 20, paddingBottom: 50 }} pointerEvents="box-none">
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' }}>
            {!isDone && <PulsingIndicator />}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>EMERGENCY KIT</Text>
              <View style={{ backgroundColor: 'rgba(59,130,246,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.5)' }}>
                <Text style={{ color: '#93C5FD', fontWeight: '900', fontSize: 14 }}>{collectedItems.length} / {ITEMS_TO_COLLECT.length}</Text>
              </View>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '700', marginBottom: 16 }}>Drag items into the kit below.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {ITEMS_TO_COLLECT.map((item) => {
                const isCollected = collectedItems.includes(item.id);
                return (
                  <View key={`inv-${item.id}`} style={{ width: '22%', aspectRatio: 1, backgroundColor: isCollected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.05)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isCollected ? '#FFFFFF' : 'rgba(255,255,255,0.1)', paddingHorizontal: 4, paddingVertical: 6 }}>
                    {isCollected && (
                      <Animated.View entering={ZoomIn} style={{ alignItems: 'center' }}>
                        <Image source={item.source} style={{ width: 32, height: 32 }} resizeMode="contain" />
                        <Text style={{ marginTop: 4, fontSize: 9, fontWeight: '900', color: '#111827', textAlign: 'center' }} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </Animated.View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </GameStep>
    </GestureHandlerRootView>
  );
}
