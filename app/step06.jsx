import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  {
    id: 'bed_ready',
    image: require('../assets/images/AddTowel.png'),
    instruction: 'Bed is prepared. Help the mother lie down gently.',
    actionLabel: 'PLACE MOTHER ON BED',
  },
  {
    id: 'mother_on_bed',
    image: require('../assets/images/PlaceMotherInBed.png'),
    instruction: 'Mother is on the bed. Now position her semi-reclined with pillow support.',
    actionLabel: 'POSITION WITH PILLOWS',
  },
  {
    id: 'positioned',
    image: require('../assets/images/PositionTheMother.png'),
    instruction: 'Perfect position! Semi-reclined with knees bent and supported.',
    actionLabel: null,
  },
];

export default function Step06() {
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
        // Automatically complete
        setTimeout(() => {
          markStepComplete(6);
        }, 1500);
      }
    }, 300);
  }, [sceneIndex, transitioning, isDone]);

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {SCENE_PROGRESSION.map((s, i) => (
        i <= sceneIndex && (
          <Animated.View key={s.id} entering={FadeIn.duration(600)} 
            style={{ position: 'absolute', top: -80, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <ImageBackground source={s.image} style={{ flex: 1, width: '100%', height: '115%' }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      {/* Dark overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 2 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2 }}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={6} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{
              backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14,
              borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0',
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>POSITIONED CORRECTLY</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 110 }} pointerEvents="box-none">
          <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{scene.instruction}</Text>
          </Animated.View>

          {scene.actionLabel && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
                style={{ backgroundColor: transitioning ? '#6B7280' : '#2563EB', borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={6} />
      </SafeAreaView>

      {/* No success popups */}
    </View>
  );
}
