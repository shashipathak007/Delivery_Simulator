import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  {
    id: 'crowning',
    image: require('../assets/images/Crowning.png'),
    instruction: 'The baby\'s head is appearing! Place a clean towel below to support it.',
    actionLabel: 'PLACE TOWEL BELOW HEAD',
  },
  {
    id: 'supported',
    image: require('../assets/images/Crowning.png'),
    instruction: 'Towel placed! Head is supported and cushioned.',
  },
];

export default function Step08() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    setTransitioning(true);
    addScore(50);

    setTimeout(() => {
      setSceneIndex(1);
      setTransitioning(false);
      setTimeout(() => markStepComplete(8), 1500);
    }, 300);
  }, [transitioning, isDone]);

  return (
    <GameStep 
      step={8} 
      score={score} 
      scenes={SCENE_PROGRESSION} 
      sceneIndex={sceneIndex} 
      isDone={isDone} 
      showConfetti={isDone}
      statusTitle="HEAD SUPPORTED"
      statusDetail="SAFE & CUSHIONED"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {!isDone && (
          <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>CROWNING</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.8 }}>Baby's head is appearing</Text>
          </Animated.View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>

        {scene.actionLabel && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
              style={{ backgroundColor: '#EC4899', borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
