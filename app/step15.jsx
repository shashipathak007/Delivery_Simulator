import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn, useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const SCENE_PROGRESSION = [
  { id: 'start', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Massage the abdomen to prevent bleeding.', actionLabel: 'START MASSAGE' },
  { id: 'massaging', image: require('../assets/images/Massaging.png'), instruction: 'Massage firmly in circular motions!', actionLabel: 'MASSAGE', isInteractive: true },
  { id: 'done', image: require('../assets/images/Massage_LowerAbdomen.png'), instruction: 'The uterus feels firm. Bleeding controlled!' },
];

export default function Step15() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [massageCount, setMassageCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const distance = useSharedValue(0);
  const lastPos = useSharedValue({ x: 0, y: 0 });

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 2;

  const onMassageComplete = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setSceneIndex(2);
      setTransitioning(false);
      setTimeout(() => markStepComplete(15), 1500);
    }, 500);
  }, [markStepComplete]);

  const incrementMassage = useCallback(() => {
    setMassageCount(prev => {
      const next = prev + 1;
      addScore(10);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
      if (next >= 20) { // Increased to 20 for drag feel, adjust if needed
        runOnJS(onMassageComplete)();
      }
      return next;
    });
  }, [addScore, onMassageComplete]);

  const panGesture = Gesture.Pan()
    .enabled(sceneIndex === 1 && !transitioning)
    .onBegin((e) => {
      lastPos.value = { x: e.x, y: e.y };
    })
    .onUpdate((e) => {
      const d = Math.sqrt(Math.pow(e.x - lastPos.value.x, 2) + Math.pow(e.y - lastPos.value.y, 2));
      distance.value += d;
      lastPos.value = { x: e.x, y: e.y };

      if (distance.value >= 150) { // Every 150 units of drag distance = 1 point
        distance.value = 0;
        runOnJS(incrementMassage)();
      }
    });

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    if (sceneIndex === 0) {
      setTransitioning(true);
      setTimeout(() => { setSceneIndex(1); setTransitioning(false); }, 300);
    }
  }, [sceneIndex, transitioning, isDone]);

  return (
    <GameStep step={15} score={score} scenes={SCENE_PROGRESSION} sceneIndex={sceneIndex} isDone={isDone} showConfetti={isDone}>
      {sceneIndex === 1 && (
        <GestureDetector gesture={panGesture}>
          <View style={{ position: 'absolute', top: height * 0.3, left: 0, right: 0, height: height * 0.4, zIndex: 10, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 250, height: 250, borderRadius: 125, borderWidth: 2, borderColor: 'rgba(236,72,153,0.3)', borderStyle: 'dashed', backgroundColor: 'rgba(236,72,153,0.05)', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(236,72,153,0.5)', fontWeight: '900', fontSize: 12 }}>DRAG IN CIRCLES HERE</Text>
            </View>
          </View>
        </GestureDetector>
      )}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none" />
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        {sceneIndex === 1 && !isDone && (
          <Animated.View entering={ZoomIn} style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>MASSAGING... {massageCount}/20</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: '#EC4899', borderRadius: 3, width: `${Math.min((massageCount / 20) * 100, 100)}%` }} />
            </View>
          </Animated.View>
        )}
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && sceneIndex === 0 && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.7}
              style={{ backgroundColor: transitioning ? '#6B7280' : '#EC4899', borderRadius: 18, paddingVertical: 20, alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
