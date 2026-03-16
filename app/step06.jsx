import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'bed_ready', image: require('../assets/images/Clean_Bed.jpg'), instruction: 'Bed is prepared. Help the mother lie down.', actionLabel: 'PLACE MOTHER ON BED' },
  { id: 'mother_on_bed', image: require('../assets/images/Pregnent_Mother_In_Bed.jpg'), instruction: 'Mother is on the bed. Position with pillow support.', actionLabel: 'POSITION WITH PILLOWS' },
  { id: 'positioned', image: require('../assets/images/Mother_Positioned.jpg'), instruction: 'Perfect! Semi-reclined with knees bent and supported.' },
];

export default function Step06() {
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
      const next = sceneIndex + 1;
      setSceneIndex(next);
      setTransitioning(false);
      if (next === SCENE_PROGRESSION.length - 1) setTimeout(() => markStepComplete(6), 1500);
    }, 300);
  }, [sceneIndex, transitioning, isDone]);

  return (
    <GameStep 
      step={6} 
      score={score} 
      scenes={SCENE_PROGRESSION} 
      sceneIndex={sceneIndex} 
      isDone={isDone} 
      showConfetti={isDone}
      statusTitle="MOTHER POSITIONED"
      statusDetail="COMFORTABLE & READY"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none" />
      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }} pointerEvents="box-none">
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
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
