import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'left_shoulder', image: require('../assets/images/DeliverTheLeftShoulder.png'), instruction: 'Guide the left shoulder out gently.', actionLabel: 'DELIVER LEFT SHOULDER' },
  { id: 'right_shoulder', image: require('../assets/images/DeliverRigtharm.png'), instruction: 'Left done! Now the right shoulder.', actionLabel: 'DELIVER RIGHT SHOULDER' },
  { id: 'delivered', image: require('../assets/images/BabyIsDelivered.png'), instruction: 'Baby delivered! The body slides out naturally.' },
];

export default function Step10() {
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
      if (next === SCENE_PROGRESSION.length - 1) setTimeout(() => markStepComplete(10), 1500);
    }, 400);
  }, [sceneIndex, transitioning, isDone]);

  const scenes = SCENE_PROGRESSION.map(s => ({
    ...s,
    resizeMode: 'contain',
  }));

  return (
    <GameStep 
      step={10} 
      score={score} 
      scenes={scenes} 
      sceneIndex={sceneIndex} 
      isDone={isDone} 
      showConfetti={isDone}
      statusTitle="BABY DELIVERED"
      statusDetail="SAFE IN HANDS"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none" />
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>Never pull. Let the baby slide out naturally.</Text>
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
