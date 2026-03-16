import React, { useState, useCallback } from 'react';
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
    id: 'start',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'To prevent severe bleeding, firmly massage the mother\'s abdomen right below the navel.',
    actionLabel: 'START FUNDAL MASSAGE',
  },
  {
    id: 'massaging',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Massage firmly in circular motions until the uterus feels like a hard grapefruit.',
    actionLabel: 'MASSAGE FIRMLY',
    isInteractive: true,
  },
  {
    id: 'done',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'The uterus feels firm. Bleeding is controlled.',
    actionLabel: null,
  },
];

export default function Step15() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [sceneIndex, setSceneIndex] = useState(0);
  const [massageCount, setMassageCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 2;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    
    if (sceneIndex === 0) {
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex(1);
        setTransitioning(false);
      }, 300);
      return;
    }

    if (sceneIndex === 1) {
      const newCount = massageCount + 1;
      setMassageCount(newCount);
      addScore(10);
      
      if (newCount >= 8) { // Required massages
        setTransitioning(true);
        setTimeout(() => {
          setSceneIndex(2);
          setTransitioning(false);
          setTimeout(() => setShowSuccess(true), 800);
        }, 300);
      }
      return;
    }

  }, [sceneIndex, transitioning, isDone, massageCount]);

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
        <StepHeader step={15} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {sceneIndex === 1 && (
             <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
               <View style={{ alignItems: 'center', gap: 6 }}>
                 <Image source={require('../assets/images/clean hands.png')} style={{ width: 60, height: 60, tintColor: '#FFFFFF' }} resizeMode="contain" />
                 <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 24, letterSpacing: 2 }}>{massageCount} / 8</Text>
                 <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center' }}>Massages</Text>
               </View>
             </Animated.View>
          )}
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>UTERUS FIRM</Text>
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
                  backgroundColor: transitioning ? '#6B7280' : '#EC4899', 
                  borderRadius: 18, paddingVertical: 20, alignItems: 'center', 
                  borderBottomWidth: 4, borderBottomColor: transitioning ? '#4B5563' : '#BE185D', 
                  shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>
                  {scene.actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={15} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Bleeding controlled. The mother is safe." 
          onComplete={() => { setShowSuccess(false); markStepComplete(15); }} />
      )}
    </View>
  );
}
