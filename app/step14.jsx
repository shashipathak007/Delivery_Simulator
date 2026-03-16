import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, Image } from 'react-native';
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
    id: 'waiting',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Keep baby skin-to-skin while waiting for the placenta. NEVER pull the cord!',
    actionLabel: null,
    isWarning: true,
  },
  {
    id: 'delivered',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'The placenta has delivered naturally! We need to store it safely for doctors to inspect.',
    actionLabel: 'PLACE IN PLASTIC BAG',
    showPlacenta: true,
  },
  {
    id: 'stored',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Placenta is secured in a bag. Do not throw it away! Paramedics must examine it.',
    actionLabel: null,
  },
];

export default function Step14() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [sceneIndex, setSceneIndex] = useState(0);
  const [waitTime, setWaitTime] = useState(15);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  useEffect(() => {
    let interval;
    if (sceneIndex === 0 && waitTime > 0) {
      interval = setInterval(() => {
        setWaitTime((prev) => prev - 1);
      }, 300); // Fast forward timer for simulation purposes
    } else if (sceneIndex === 0 && waitTime === 0) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
      setSceneIndex(1);
    }
    return () => clearInterval(interval);
  }, [sceneIndex, waitTime]);

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setTransitioning(true);
    addScore(100);

    setTimeout(() => {
      setSceneIndex(2);
      setTransitioning(false);
      setTimeout(() => setShowSuccess(true), 800);
    }, 400);

  }, [sceneIndex, transitioning, isDone]);

  // Dynamic colors
  const getButtonColor = () => transitioning ? '#6B7280' : '#2563EB';
  const getButtonBorder = () => transitioning ? '#4B5563' : '#1D4ED8';

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View key={s.id} entering={FadeIn.duration(500)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <ImageBackground source={s.image} style={{ flex: 1 }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 350, zIndex: 2, backgroundColor: scene.isWarning ? 'rgba(127,29,29,0.85)' : 'rgba(0,0,0,0.75)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={14} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {scene.isWarning && waitTime > 0 && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(239,68,68,0.95)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 3, borderColor: '#FCA5A5', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>DO NOT PULL CORD</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 32, letterSpacing: 2, marginTop: 10 }}>{waitTime} m</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Waiting for placenta to detach naturally...</Text>
            </Animated.View>
          )}

          {scene.showPlacenta && (
            <Animated.View entering={ZoomIn.springify()} style={{ 
              backgroundColor: 'rgba(255,255,255,0.95)', padding: 15, borderRadius: 30, 
              borderWidth: 4, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 15
            }}>
              <Image source={require('../assets/images/placenta.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
            </Animated.View>
          )}

          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>PLACENTA SECURED</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
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
                  backgroundColor: getButtonColor(), borderRadius: 16, paddingVertical: 20, alignItems: 'center',
                  borderBottomWidth: 4, borderBottomColor: getButtonBorder(),
                  shadowColor: getButtonColor(), shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12,
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }}>
                  {scene.actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={14} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Placenta secured for medical review. Well done!" 
          onComplete={() => { setShowSuccess(false); markStepComplete(14); }} />
      )}
    </View>
  );
}
