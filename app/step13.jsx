import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  { id: 'intact', image: require('../assets/images/CordIntact.png'), instruction: 'Cord has stopped pulsing. Tie the first string on baby\'s side.', actionLabel: 'TIE FIRST STRING', icon: require('../assets/images/string.jpg'), resizeMode: 'contain' },
  { id: 'tied_left', image: require('../assets/images/TieCordOnLeft.png'), instruction: 'First tie secure! Tie second string on mother\'s side.', actionLabel: 'TIE SECOND STRING', icon: require('../assets/images/string.jpg'), resizeMode: 'contain' },
  { id: 'tied_right', image: require('../assets/images/TiecordOnRight.png'), instruction: '⚠️ Cut the cord BETWEEN the two ties!', actionLabel: 'CUT CORD', icon: require('../assets/images/scissors.png'), isWarning: true, resizeMode: 'contain' },
  { id: 'cut_done', image: require('../assets/images/CutTheCowd.png'), instruction: 'Cord tied and cut safely!', resizeMode: 'contain' },
];

export default function Step13() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setTransitioning(true);
    addScore(50);
    setTimeout(() => {
      const next = sceneIndex + 1;
      setSceneIndex(next);
      setTransitioning(false);
      if (next === SCENE_PROGRESSION.length - 1) setTimeout(() => markStepComplete(13), 1500);
    }, 400);
  }, [sceneIndex, transitioning, isDone]);

  const btnColor = transitioning ? '#6B7280' : (scene.isWarning ? '#EF4444' : '#2563EB');

  return (
    <GameStep step={13} score={score} scenes={SCENE_PROGRESSION} sceneIndex={sceneIndex} isDone={isDone} showConfetti={isDone}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {scene.isWarning && (
          <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(239,68,68,0.95)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 3, borderColor: '#FCA5A5', marginTop: -475 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2, textAlign: 'center' }}>⚠️ CAUTION</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Cut in the middle!</Text>
          </Animated.View>
        )}
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: scene.isWarning ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: scene.isWarning ? 2 : 1.5, borderColor: scene.isWarning ? '#FCA5A5' : 'rgba(255,255,255,0.15)', marginBottom: 22 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
              style={{ backgroundColor: btnColor, borderRadius: 18, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12, shadowColor: btnColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <View style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={scene.icon} style={{ width: 22, height: 22 }} resizeMode="contain" />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
