import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  {
    id: 'support_head',
    image: require('../assets/images/Crowning.png'),
    instruction: 'Support the head with both hands gently.',
    actionLabel: 'SUPPORT HEAD WITH BOTH HANDS',
  },
  {
    id: 'both_hands',
    image: require('../assets/images/BothHands.png'),
    instruction: 'Head supported! Now feel around the neck for the umbilical cord.',
    actionLabel: 'CHECK FOR CORD AROUND NECK',
  },
  {
    id: 'cord_found',
    image: require('../assets/images/CordAroundNeck.png'),
    instruction: 'WARNING! Cord is wrapped around the neck! Loosen it immediately!',
    actionLabel: 'GENTLY LOOSEN THE CORD',
    isWarning: true,
  },
  {
    id: 'cord_loosened',
    image: require('../assets/images/LoosenTheCord.png'),
    instruction: 'Cord loosened successfully! Baby is safe to continue delivery.',
    actionLabel: null,
  },
];

export default function Step09() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(scene.isWarning ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setTransitioning(true);
    addScore(50);

    // Slight delay on cord check to build tension
    const delay = sceneIndex === 1 ? 1200 : 300;

    setTimeout(() => {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      setTransitioning(false);
      if (nextIndex === SCENE_PROGRESSION.length - 1) {
        setTimeout(() => setShowSuccess(true), 800);
      }
    }, delay);
  }, [sceneIndex, transitioning, isDone, scene]);

  // Dynamic button color based on state
  const getButtonColor = () => {
    if (transitioning) return '#6B7280';
    if (scene.isWarning) return '#EF4444';
    if (sceneIndex === 1) return '#F59E0B'; // Check cord = orange/warning
    return '#2563EB';
  };

  const getButtonBorder = () => {
    if (transitioning) return '#4B5563';
    if (scene.isWarning) return '#B91C1C';
    if (sceneIndex === 1) return '#D97706';
    return '#1D4ED8';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View key={s.id} entering={FadeIn.duration(600)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <ImageBackground source={s.image} style={{ flex: 1 }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.55)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, zIndex: 2, backgroundColor: scene.isWarning ? 'rgba(127,29,29,0.8)' : 'rgba(0,0,0,0.7)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={9} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {scene.isWarning && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(239,68,68,0.95)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 3, borderColor: '#FCA5A5' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 20, letterSpacing: 3, textAlign: 'center' }}>DANGER</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12, textAlign: 'center', marginTop: 4 }}>Cord around neck detected!</Text>
            </Animated.View>
          )}

          {sceneIndex === 1 && transitioning && (
            <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(245,158,11,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#FDE68A' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>CHECKING...</Text>
            </Animated.View>
          )}

          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>CORD CLEARED</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          {/* Progress dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 6 }}>
            {['Support', 'Check', 'Loosen'].map((name, i) => {
              const done = sceneIndex > i;
              return (
                <View key={i} style={{ 
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
                  backgroundColor: done ? 'rgba(16,185,129,0.9)' : sceneIndex === i + 1 && scene.isWarning ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.15)',
                  borderWidth: 1.5, borderColor: done ? '#A7F3D0' : 'rgba(255,255,255,0.2)',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 }}>{name}</Text>
                </View>
              );
            })}
          </View>

          <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ 
              backgroundColor: scene.isWarning ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.12)', 
              borderRadius: 20, padding: 18, marginBottom: 16, 
              borderWidth: scene.isWarning ? 2 : 1, 
              borderColor: scene.isWarning ? '#FCA5A5' : 'rgba(255,255,255,0.2)' 
            }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{scene.instruction}</Text>
          </Animated.View>

          {scene.actionLabel && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
                style={{ 
                  backgroundColor: getButtonColor(), borderRadius: 18, paddingVertical: 20, alignItems: 'center',
                  borderBottomWidth: 4, borderBottomColor: getButtonBorder(),
                  shadowColor: getButtonColor(), shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14,
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center' }}>
                  {scene.actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={9} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Head supported and cord cleared! Delivery can continue safely." 
          onComplete={() => { setShowSuccess(false); markStepComplete(9); }} />
      )}
    </View>
  );
}
