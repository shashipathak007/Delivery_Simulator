import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'initial', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Baby isn\'t crying loudly. Rub the back to stimulate breathing!', actionLabel: 'RUB BABY\'S BACK' },
  { id: 'rubbing', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Keep rubbing gently...', actionLabel: 'RUB BACK', isInteractive: true },
  { id: 'tapping', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Now tap the soles of the feet!', actionLabel: 'TAP FEET', isInteractive: true },
  { id: 'crying', image: require('../assets/images/BabyCries.png'), instruction: 'Baby is crying loudly and breathing well!' },
];

export default function Step12() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [rubCount, setRubCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 3;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (sceneIndex === 0) { setTransitioning(true); setTimeout(() => { setSceneIndex(1); setTransitioning(false); }, 300); return; }
    if (sceneIndex === 1) {
      const n = rubCount + 1; setRubCount(n); addScore(10);
      if (n >= 5) { setTransitioning(true); setTimeout(() => { setSceneIndex(2); setTransitioning(false); }, 300); }
      return;
    }
    if (sceneIndex === 2) {
      const n = tapCount + 1; setTapCount(n); addScore(10);
      if (n >= 5) { setTransitioning(true); setTimeout(() => { setSceneIndex(3); setTransitioning(false); setTimeout(() => markStepComplete(12), 1500); }, 300); }
      return;
    }
  }, [sceneIndex, transitioning, isDone, rubCount, tapCount]);

  return (
    <GameStep step={12} score={score} scenes={SCENE_PROGRESSION} sceneIndex={sceneIndex} isDone={isDone} showConfetti={isDone}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {sceneIndex === 1 && (
          <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(37,99,235,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#93C5FD' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 28, letterSpacing: 2 }}>{rubCount} / 5</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Rubs</Text>
          </Animated.View>
        )}
        {sceneIndex === 2 && (
          <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 28, letterSpacing: 2 }}>{tapCount} / 5</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Taps</Text>
          </Animated.View>
        )}
        {isDone && (
          <Animated.View entering={BounceIn} style={{ backgroundColor: 'rgba(16,185,129,0.95)', paddingHorizontal: 32, paddingVertical: 20, borderRadius: 28, borderWidth: 2, borderColor: '#A7F3D0', shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 20, alignItems: 'center' }}>
            <Text style={{ color: '#A7F3D0', fontWeight: '800', fontSize: 12, letterSpacing: 3, marginBottom: 4 }}>STEP COMPLETE</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 22, letterSpacing: 2 }}>BREATHING</Text>
          </Animated.View>
        )}
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && (
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
