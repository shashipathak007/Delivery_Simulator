import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'support_head', image: require('../assets/images/Crowning.png'), instruction: 'Support the head gently with both hands.', actionLabel: 'SUPPORT HEAD' },
  { id: 'both_hands', image: require('../assets/images/BothHands.png'), instruction: 'Head supported! Now check for the umbilical cord around the neck.', actionLabel: 'CHECK FOR CORD' },
  { id: 'cord_found', image: require('../assets/images/CordAroundNeck.png'), instruction: '⚠️ Cord around the neck! Loosen it now!', actionLabel: 'LOOSEN THE CORD', isWarning: true },
  { id: 'cord_loosened', image: require('../assets/images/LoosenTheCord.png'), instruction: 'Cord loosened! Baby is safe to continue.' },
];

export default function Step09() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(scene.isWarning ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    setTransitioning(true);
    addScore(50);
    const delay = sceneIndex === 1 ? 1200 : 300;

    setTimeout(() => {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      setTransitioning(false);
      if (nextIndex === SCENE_PROGRESSION.length - 1) {
        setTimeout(() => markStepComplete(9), 1500);
      }
    }, delay);
  }, [sceneIndex, transitioning, isDone, scene]);

  const getButtonColor = () => {
    if (transitioning) return '#6B7280';
    if (scene.isWarning) return '#EF4444';
    if (sceneIndex === 1) return '#F59E0B';
    return '#2563EB';
  };

  const scenes = SCENE_PROGRESSION.map(s => ({
    ...s,
    resizeMode: 'contain',
  }));

  return (
    <GameStep 
      step={9} 
      score={score} 
      scenes={scenes} 
      sceneIndex={sceneIndex} 
      isDone={isDone} 
      showConfetti={isDone}
      statusTitle="CORD CLEARED"
      statusDetail="SAFE PROGRESSION"
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {scene.isWarning && (
          <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(239,68,68,0.95)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 3, borderColor: '#FCA5A5' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 20, letterSpacing: 3, textAlign: 'center' }}>⚠️ DANGER</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12, textAlign: 'center', marginTop: 4 }}>Cord around neck!</Text>
          </Animated.View>
        )}
        {sceneIndex === 1 && transitioning && (
          <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(245,158,11,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#FDE68A' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>CHECKING...</Text>
          </Animated.View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)}
          style={{ backgroundColor: scene.isWarning ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: scene.isWarning ? 2 : 1.5, borderColor: scene.isWarning ? '#FCA5A5' : 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
              style={{ backgroundColor: getButtonColor(), borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: getButtonColor(), shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
