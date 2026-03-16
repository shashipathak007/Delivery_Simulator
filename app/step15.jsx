import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'start', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Massage the abdomen to prevent bleeding.', actionLabel: 'START MASSAGE' },
  { id: 'massaging', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Massage firmly in circular motions!', actionLabel: 'MASSAGE', isInteractive: true },
  { id: 'done', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'The uterus feels firm. Bleeding controlled!' },
];

export default function Step15() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [massageCount, setMassageCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 2;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    if (sceneIndex === 0) { setTransitioning(true); setTimeout(() => { setSceneIndex(1); setTransitioning(false); }, 300); return; }
    if (sceneIndex === 1) {
      const n = massageCount + 1; setMassageCount(n); addScore(10);
      if (n >= 8) { setTransitioning(true); setTimeout(() => { setSceneIndex(2); setTransitioning(false); setTimeout(() => markStepComplete(15), 1500); }, 300); }
      return;
    }
  }, [sceneIndex, transitioning, isDone, massageCount]);

  return (
    <GameStep step={15} score={score} scenes={SCENE_PROGRESSION} sceneIndex={sceneIndex} isDone={isDone} showConfetti={isDone}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {sceneIndex === 1 && (
          <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 28, letterSpacing: 2 }}>{massageCount} / 8</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Massages</Text>
          </Animated.View>
        )}
        {isDone && (
          <Animated.View entering={BounceIn} style={{ backgroundColor: 'rgba(16,185,129,0.95)', paddingHorizontal: 32, paddingVertical: 20, borderRadius: 28, borderWidth: 2, borderColor: '#A7F3D0', shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 20, alignItems: 'center' }}>
            <Text style={{ color: '#A7F3D0', fontWeight: '800', fontSize: 12, letterSpacing: 3, marginBottom: 4 }}>STEP COMPLETE</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 20, letterSpacing: 2 }}>BLEEDING CONTROLLED</Text>
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
              style={{ backgroundColor: transitioning ? '#6B7280' : '#EC4899', borderRadius: 18, paddingVertical: 20, alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
