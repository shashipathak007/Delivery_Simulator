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
    id: 'initial',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'If the baby is not crying loudly, stimulate breathing by rubbing its back.',
    actionLabel: 'RUB BABY\'S BACK',
    actionType: 'rub',
  },
  {
    id: 'rubbing',
    image: require('../assets/images/RubBackAndTapFeet.png'),
    instruction: 'Rubbing back gently... (keep tapping to stimulate)',
    actionLabel: 'RUB BACK',
    actionType: 'rub',
    isInteractive: true,
  },
  {
    id: 'tapping',
    image: require('../assets/images/RubBackAndTapFeet.png'),
    instruction: 'Now tap the soles of the baby\'s feet gently.',
    actionLabel: 'TAP FEET',
    actionType: 'tap',
    isInteractive: true,
  },
  {
    id: 'crying',
    image: require('../assets/images/BabyCries.png'),
    instruction: 'Excellent! The baby is crying loudly and breathing well.',
    actionLabel: null,
  },
];

export default function Step12() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [sceneIndex, setSceneIndex] = useState(0);
  const [rubCount, setRubCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 3;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
    
    // First click transitions to the interactive rubbing scene
    if (sceneIndex === 0) {
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex(1);
        setTransitioning(false);
      }, 300);
      return;
    }

    // Interactive rub
    if (sceneIndex === 1) {
      const newRub = rubCount + 1;
      setRubCount(newRub);
      addScore(10);
      
      if (newRub >= 5) { // Required rubs
        setTransitioning(true);
        setTimeout(() => {
          setSceneIndex(2);
          setTransitioning(false);
        }, 300);
      }
      return;
    }

    // Interactive tap
    if (sceneIndex === 2) {
      const newTap = tapCount + 1;
      setTapCount(newTap);
      addScore(10);
      
      if (newTap >= 5) { // Required taps
        setTransitioning(true);
        setTimeout(() => {
          setSceneIndex(3);
          setTransitioning(false);
          setTimeout(() => setShowSuccess(true), 800);
        }, 300);
      }
      return;
    }

  }, [sceneIndex, transitioning, isDone, rubCount, tapCount]);

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View key={s.id} entering={FadeIn.duration(400)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <ImageBackground source={s.image} style={{ flex: 1 }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.65)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={12} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {sceneIndex === 1 && (
             <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(37,99,235,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#93C5FD' }}>
               <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 24, letterSpacing: 2 }}>{rubCount} / 5</Text>
               <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Rubs</Text>
             </Animated.View>
          )}
          {sceneIndex === 2 && (
             <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
               <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 24, letterSpacing: 2 }}>{tapCount} / 5</Text>
               <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Taps</Text>
             </Animated.View>
          )}
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>BREATHING STIMULATED</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{scene.instruction}</Text>
          </Animated.View>

          {scene.actionLabel && (
            <Animated.View entering={FadeInUp.delay(100).duration(300)}>
              <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.7}
                style={{ 
                  backgroundColor: transitioning ? '#6B7280' : (sceneIndex === 2 ? '#EC4899' : '#2563EB'), 
                  borderRadius: 18, paddingVertical: 20, alignItems: 'center', 
                  borderBottomWidth: 4, borderBottomColor: transitioning ? '#4B5563' : (sceneIndex === 2 ? '#BE185D' : '#1D4ED8'), 
                  shadowColor: sceneIndex === 2 ? '#EC4899' : '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>
                  {scene.actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={12} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Excellent! The baby responds well to stimulation. Time to tie the cord." 
          onComplete={() => { setShowSuccess(false); markStepComplete(12); }} />
      )}
    </View>
  );
}
