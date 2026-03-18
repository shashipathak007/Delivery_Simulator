import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'waiting', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Keep baby skin-to-skin. NEVER pull the cord! Wait for placenta.', isWarning: true },
  { id: 'delivered', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Placenta delivered naturally! Store it safely.', actionLabel: 'PLACE IN PLASTIC BAG', showPlacenta: true },
  { id: 'stored', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Placenta secured. Paramedics will examine it.' },
];

export default function Step14() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [waitTime, setWaitTime] = useState(15);
  const [transitioning, setTransitioning] = useState(false);
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  useEffect(() => {
    let interval;
    if (sceneIndex === 0 && waitTime > 0) {
      interval = setInterval(() => setWaitTime(p => p - 1), 300);
    } else if (sceneIndex === 0 && waitTime === 0) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
      setSceneIndex(1);
    }
    return () => clearInterval(interval);
  }, [sceneIndex, waitTime]);

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setTransitioning(true);
    addScore(100);
    setTimeout(() => {
      setSceneIndex(2);
      setTransitioning(false);
      setTimeout(() => markStepComplete(14), 1500);
    }, 400);
  }, [transitioning, isDone]);

  return (
    <GameStep step={14} score={score} scenes={SCENE_PROGRESSION} sceneIndex={sceneIndex} isDone={isDone} showConfetti={isDone}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {scene.isWarning && waitTime > 0 && (
          <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(239,68,68,0.95)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 3, borderColor: '#FCA5A5', alignItems: 'center', marginTop: -470 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>DO NOT PULL CORD</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 32, letterSpacing: 2, marginTop: 10 }}>{waitTime} m</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Waiting for placenta...</Text>
          </Animated.View>
        )}
        {scene.showPlacenta && (
          <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: 15, borderRadius: 30, borderWidth: 4, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 15, marginTop: -350, marginBottom: 20 }}>
            <Image source={require('../assets/images/placenta.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
          </Animated.View>
        )}
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <View style={{ marginBottom: scene.actionLabel ? 20 : 0, zIndex: 1 }} pointerEvents="none">
          <Animated.View 
            key={`instr-${sceneIndex}`} 
            entering={SlideInRight.duration(400)} 
            style={{ 
              backgroundColor: scene.isWarning ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.5)', 
              borderRadius: 24, padding: 20, 
              borderWidth: scene.isWarning ? 2 : 1.5, 
              borderColor: scene.isWarning ? '#FCA5A5' : 'rgba(255,255,255,0.15)'
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
          </Animated.View>
        </View>
        {scene.actionLabel && (
          <View style={{ zIndex: 10 }}>
            <Animated.View entering={FadeInUp.delay(200)}>
              <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
                style={{ backgroundColor: transitioning ? '#6B7280' : '#2563EB', borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </GameStep>
  );
}
