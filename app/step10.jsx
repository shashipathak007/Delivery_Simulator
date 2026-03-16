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
    id: 'left_shoulder',
    image: require('../assets/images/DeliverTheLeftShoulder.png'),
    instruction: 'Guide the left shoulder out first. Gently and slowly.',
    actionLabel: 'DELIVER LEFT SHOULDER',
  },
  {
    id: 'right_shoulder',
    image: require('../assets/images/DeliverRigtharm.png'),
    instruction: 'Left done! Now guide the right shoulder.',
    actionLabel: 'DELIVER RIGHT SHOULDER',
  },
  {
    id: 'delivered',
    image: require('../assets/images/BabyIsDelivered.png'),
    instruction: 'Baby delivered! The body slides out after the shoulders.',
    actionLabel: null,
  },
];

export default function Step10() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setTransitioning(true);
    addScore(50);

    setTimeout(() => {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      setTransitioning(false);
      if (nextIndex === SCENE_PROGRESSION.length - 1) {
        setTimeout(() => setShowSuccess(true), 800);
      }
    }, 400);
  }, [sceneIndex, transitioning, isDone]);

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
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.65)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={10} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 20, letterSpacing: 2 }}>BABY DELIVERED!</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 8 }}>
            {['Left', 'Right'].map((side, i) => (
              <View key={i} style={{ 
                paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14,
                backgroundColor: sceneIndex > i ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.15)',
                borderWidth: 1.5, borderColor: sceneIndex > i ? '#A7F3D0' : 'rgba(255,255,255,0.2)',
              }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 }}>{side} Shoulder</Text>
              </View>
            ))}
          </View>

          <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{scene.instruction}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              Never pull. Let the baby slide out naturally.
            </Text>
          </Animated.View>

          {scene.actionLabel && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
                style={{ backgroundColor: transitioning ? '#6B7280' : '#2563EB', borderRadius: 18, paddingVertical: 18, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: transitioning ? '#4B5563' : '#1D4ED8', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={10} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Both shoulders delivered! Baby is out safely." 
          onComplete={() => { setShowSuccess(false); markStepComplete(10); }} />
      )}
    </View>
  );
}
