import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable, Dimensions, Image } from 'react-native';
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
  { id: 'initial', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Baby isn\'t crying loudly. Rub the back to stimulate breathing!', actionLabel: 'RUB BABY\'S BACK' },
  { id: 'rubbing', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Rub the towel on the baby to stimulate breathing...', isInteractive: true },
  { id: 'tapping', image: require('../assets/images/BabyFeet.png'), instruction: 'Now tap the soles of the feet!', actionLabel: 'TAP FEET', isInteractive: true },
  { id: 'crying', image: require('../assets/images/BabyCries.png'), instruction: 'Baby is crying loudly and breathing well!' },
];

const RUB_THRESHOLD = 5;
const DISTANCE_PER_RUB = 80;

export default function Step12() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [rubCount, setRubCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const insets = useSafeAreaInsets();

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 3;

  const isScreenTapInteractive = sceneIndex === 2;

  // Shared values for towel rubbing gesture
  const towelX = useSharedValue(0);
  const towelY = useSharedValue(0);
  const towelScale = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const lastPos = useSharedValue({ x: 0, y: 0 });
  const accumulatedDistance = useSharedValue(0);
  const rubCountRef = useRef(0);

  const handleRubIncrement = useCallback(() => {
    if (transitioning || sceneIndex !== 1) return;

    const n = Math.min(rubCountRef.current + 1, RUB_THRESHOLD);
    rubCountRef.current = n;
    setRubCount(n);
    addScore(10);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}

    if (n >= RUB_THRESHOLD) {
      setTransitioning(true);
      setTimeout(() => { setSceneIndex(2); setTransitioning(false); }, 300);
    }
  }, [transitioning, sceneIndex, addScore]);

  // Pan gesture for rubbing the towel
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

      const dx = e.x - lastPos.value.x;
      const dy = e.y - lastPos.value.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      accumulatedDistance.value += d;
      lastPos.value = { x: e.x, y: e.y };

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
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    
    // Scene 0: button press to start rubbing
    if (sceneIndex === 0) { 
      setTransitioning(true); 
      setTimeout(() => { setSceneIndex(1); setTransitioning(false); }, 300); 
      return; 
    }
    
    // Scene 2: tap feet
    if (sceneIndex === 2) {
      const n = tapCount + 1; 
      setTapCount(n); 
      addScore(10);
      if (n >= 5) { 
        setTransitioning(true); 
        setTimeout(() => { 
          setSceneIndex(3); 
          setTransitioning(false); 
          setTimeout(() => markStepComplete(12), 1500); 
        }, 300); 
      }
      return;
    }
  }, [sceneIndex, transitioning, isDone, tapCount]);

  return (
    <GameStep 
      step={12} 
      score={score} 
      scenes={SCENE_PROGRESSION} 
      sceneIndex={sceneIndex} 
      isDone={isDone} 
      showConfetti={isDone}
    >
      {/* Tap-anywhere interaction for TAP FEET */}
      {isScreenTapInteractive && (
        <Pressable
          onPress={handleAction}
          disabled={transitioning || isDone}
          style={{ position: 'absolute', left: 0, right: 0, top: 110, bottom: 0, zIndex: 4 }}
        />
      )}

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
                  Rub to stimulate
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
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>RUBBING BACK... {rubCount}/{RUB_THRESHOLD}</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: '#4ADE80', borderRadius: 3, width: `${Math.min((rubCount / RUB_THRESHOLD) * 100, 100)}%` }} />
            </View>
          </Animated.View>
        )}
        {sceneIndex === 2 && !isDone && (
          <Animated.View entering={ZoomIn} style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>TAPPING FEET... {tapCount}/5</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: '#EC4899', borderRadius: 3, width: `${Math.min((tapCount / 5) * 100, 100)}%` }} />
            </View>
          </Animated.View>
        )}
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && !isScreenTapInteractive && sceneIndex !== 1 && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.7}
              style={{ backgroundColor: transitioning ? '#6B7280' : (sceneIndex === 2 ? '#EC4899' : '#2563EB'), borderRadius: 18, paddingVertical: 20, alignItems: 'center', shadowColor: sceneIndex === 2 ? '#EC4899' : '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
