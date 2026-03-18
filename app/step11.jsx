import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInUp, SlideInRight, ZoomIn, BounceIn,
  useSharedValue, useAnimatedStyle, withSpring, runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const SCENE_PROGRESSION = [
  { id: 'baby_out', image: require('../assets/images/BabyIsDelivered.png'), instruction: 'Place baby on mother\'s chest for skin-to-skin contact.', actionLabel: 'PLACE BABY ON CHEST' },
  { id: 'on_chest', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Skin-to-skin! Now rub the baby gently with the towel to dry.', isDryStep: true },
  { id: 'crying', image: require('../assets/images/BabyCries.png'), instruction: 'Baby is crying — healthy sign! Baby is warm and dry.' },
];

const RUB_THRESHOLD = 5; // number of "rub units" needed
const DISTANCE_PER_RUB = 80; // pixels of movement per rub unit

export default function Step11() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [rubProgress, setRubProgress] = useState(0);
  const insets = useSafeAreaInsets();

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  // Shared values for towel drag position
  const towelX = useSharedValue(0);
  const towelY = useSharedValue(0);
  const towelScale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const lastPos = useSharedValue({ x: 0, y: 0 });
  const accumulatedDistance = useSharedValue(0);
  const rubProgressRef = useRef(0);

  const handleRubIncrement = useCallback(() => {
    if (transitioning || sceneIndex !== 1) return;

    const newProgress = Math.min(rubProgressRef.current + 1, RUB_THRESHOLD);
    rubProgressRef.current = newProgress;
    setRubProgress(newProgress);
    addScore(10);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}

    if (newProgress >= RUB_THRESHOLD) {
      setTransitioning(true);
      addScore(50);
      setTimeout(() => {
        setSceneIndex(2);
        setTransitioning(false);
        setTimeout(() => markStepComplete(11), 1500);
      }, 300);
    }
  }, [transitioning, sceneIndex, addScore, markStepComplete]);

  // Pan gesture for rubbing the towel over the baby
  const panGesture = Gesture.Pan()
    .enabled(sceneIndex === 1 && !transitioning && !isDone)
    .onBegin((e) => {
      isDragging.value = true;
      towelScale.value = withSpring(1.1);
      lastPos.value = { x: e.x, y: e.y };
      accumulatedDistance.value = 0;
    })
    .onUpdate((e) => {
      towelX.value = e.translationX;
      towelY.value = e.translationY;

      // Calculate distance moved since last update
      const dx = e.x - lastPos.value.x;
      const dy = e.y - lastPos.value.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      accumulatedDistance.value += d;
      lastPos.value = { x: e.x, y: e.y };

      // When enough distance accumulated, trigger a rub increment
      if (accumulatedDistance.value >= DISTANCE_PER_RUB) {
        accumulatedDistance.value = 0;
        runOnJS(handleRubIncrement)();
      }
    })
    .onEnd(() => {
      isDragging.value = false;
      towelScale.value = withSpring(1);
      towelX.value = withSpring(0);
      towelY.value = withSpring(0);
    });

  const towelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: towelX.value },
      { translateY: towelY.value },
      { scale: towelScale.value },
    ],
    zIndex: isDragging.value ? 999 : 1,
  }));

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setTransitioning(true);
    addScore(50);
    setTimeout(() => { setSceneIndex(1); setTransitioning(false); }, 300);
  }, [sceneIndex, transitioning, isDone]);

  return (
    <GameStep
      step={11}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={sceneIndex}
      isDone={isDone}
      showConfetti={isDone}
    >
      {/* Towel rubbing interaction zone */}
      {sceneIndex === 1 && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 15 }} pointerEvents="box-none">
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[{
              position: 'absolute',
              top: insets.top + 90,
              left: width * 0.5 - 60,
              width: 120,
              height: 120,
              alignItems: 'center',
              justifyContent: 'center',
            }, towelAnimatedStyle]}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
              }}>
                <Image
                  source={require('../assets/images/towel.png')}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>
                  Rub to dry
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      )}

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none" />

      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        {sceneIndex === 1 && !isDone && (
          <Animated.View entering={ZoomIn} style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>DRYING BABY... {rubProgress}/{RUB_THRESHOLD}</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: '#4ADE80', borderRadius: 3, width: `${Math.min((rubProgress / RUB_THRESHOLD) * 100, 100)}%` }} />
            </View>
          </Animated.View>
        )}
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
              style={{ backgroundColor: transitioning ? '#6B7280' : '#2563EB', borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
