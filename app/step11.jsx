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
    id: 'baby_out',
    image: require('../assets/images/BabyIsDelivered.png'),
    instruction: 'Place the baby on the mother\'s chest immediately for skin-to-skin contact.',
    actionLabel: 'PLACE BABY ON CHEST',
  },
  {
    id: 'on_chest',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Skin-to-skin contact! Now dry the baby gently with a clean towel.',
    actionLabel: 'DRY WITH TOWEL',
    isDryStep: true,
  },
  {
    id: 'drying',
    image: require('../assets/images/CollectTowels.png'),
    instruction: 'Drying baby carefully... gentle strokes.',
    actionLabel: null,
    autoProgress: true,
  },
  {
    id: 'crying',
    image: require('../assets/images/BabyCries.png'),
    instruction: 'Baby is crying — this is a healthy sign! Baby is warm and dry.',
    actionLabel: null,
  },
];

export default function Step11() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
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
        setTimeout(() => setShowSuccess(true), 800);
      }
    }, 250);
  };

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setTransitioning(true);
    addScore(50);

    if (scene.isDryStep) {
      setSceneIndex(2);
      startDrying();
      return;
    }

    setTimeout(() => {
      setSceneIndex(sceneIndex + 1);
      setTransitioning(false);
    }, 300);
  }, [sceneIndex, transitioning, isDone, scene]);

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

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.65)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={11} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {sceneIndex === 2 && (
            <Animated.View entering={ZoomIn} style={{ alignItems:'center', backgroundColor: 'rgba(37,99,235,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#93C5FD' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>DRYING BABY...</Text>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 10, width: 180 }}>
                <View style={{ height: 6, backgroundColor: '#FFFFFF', borderRadius: 3, width: `${dryProgress}%` }} />
              </View>
            </Animated.View>
          )}
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>BABY CRYING</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.8 }}>Healthy sign!</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{scene.instruction}</Text>
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

        <StepNavigation currentStep={11} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Baby is dry, warm, and crying! Healthy signs." 
          onComplete={() => { setShowSuccess(false); markStepComplete(11); }} />
      )}
    </View>
  );
}
