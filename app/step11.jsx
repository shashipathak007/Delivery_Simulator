import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'baby_out', image: require('../assets/images/BabyIsDelivered.png'), instruction: 'Place baby on mother\'s chest for skin-to-skin contact.', actionLabel: 'PLACE BABY ON CHEST' },
  { id: 'on_chest', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Skin-to-skin! Now dry the baby gently.', actionLabel: 'DRY WITH TOWEL', isDryStep: true },
  { id: 'drying', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Drying baby gently...', autoProgress: true },
  { id: 'crying', image: require('../assets/images/BabyCries.png'), instruction: 'Baby is crying — healthy sign! Baby is warm and dry.' },
];

export default function Step11() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [dryProgress, setDryProgress] = useState(0);
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const startDrying = () => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDryProgress(count * 10);
      if (count >= 10) {
        clearInterval(interval);
        addScore(50);
        setSceneIndex(3);
        setTransitioning(false);
        setTimeout(() => markStepComplete(11), 1500);
      }
    }, 250);
  };

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    setTransitioning(true);
    addScore(50);
    if (scene.isDryStep) { setSceneIndex(2); startDrying(); return; }
    setTimeout(() => { setSceneIndex(sceneIndex + 1); setTransitioning(false); }, 300);
  }, [sceneIndex, transitioning, isDone, scene]);

  return (
    <GameStep step={11} score={score} scenes={SCENE_PROGRESSION} sceneIndex={sceneIndex} isDone={isDone} showConfetti={isDone}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {sceneIndex === 2 && (
          <Animated.View entering={ZoomIn} style={{ alignItems: 'center', backgroundColor: 'rgba(37,99,235,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#93C5FD' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>DRYING BABY...</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 10, width: 180 }}>
              <View style={{ height: 6, backgroundColor: '#FFFFFF', borderRadius: 3, width: `${dryProgress}%` }} />
            </View>
          </Animated.View>
        )}
        {isDone && (
          <Animated.View entering={BounceIn} style={{ 
            backgroundColor: 'rgba(236,72,153,0.95)', 
            paddingHorizontal: 36, paddingVertical: 20, 
            borderRadius: 28, 
            borderWidth: 2, borderColor: '#F9A8D4', 
            shadowColor: '#EC4899', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 20, 
            alignItems: 'center' 
          }}>
            <Text style={{ color: '#F9A8D4', fontWeight: '800', fontSize: 12, letterSpacing: 3, marginBottom: 4 }}>HEALTHY SIGN</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 22, letterSpacing: 1 }}>BABY CRYING</Text>
          </Animated.View>
        )}
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
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
