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
    id: 'intact',
    image: require('../assets/images/CordIntact.png'),
    instruction: 'The umbilical cord has stopped pulsing. Time to tie it using sterile strings.',
    actionLabel: 'TIE FIRST STRING (BABY SIDE)',
    icon: require('../assets/images/string.png'),
  },
  {
    id: 'tied_left',
    image: require('../assets/images/TieCordOnLeft.png'),
    instruction: 'First tie secure! Now tie the second string closer to the mother.',
    actionLabel: 'TIE SECOND STRING (MOTHER SIDE)',
    icon: require('../assets/images/string.png'),
  },
  {
    id: 'tied_right',
    image: require('../assets/images/TiecordOnRight.png'),
    instruction: 'Both ties are secure. Now carefully cut the cord BETWEEN the two ties.',
    actionLabel: 'CUT CORD WITH STERILE SCISSORS',
    icon: require('../assets/images/scissors.png'),
    isWarning: true, // Requires caution
  },
  {
    id: 'cut_done',
    image: require('../assets/images/CutTheCowd.png'),
    instruction: 'Cord successfully tied and cut! The baby is separated from the placenta.',
    actionLabel: null,
  },
];

export default function Step13() {
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

  // Dynamic colors
  const getButtonColor = () => {
    if (transitioning) return '#6B7280';
    if (scene.isWarning) return '#EF4444'; 
    return '#2563EB';
  };
  const getButtonBorder = () => {
    if (transitioning) return '#4B5563';
    if (scene.isWarning) return '#B91C1C';
    return '#1D4ED8';
  };

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
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, zIndex: 2, backgroundColor: scene.isWarning ? 'rgba(127,29,29,0.8)' : 'rgba(0,0,0,0.75)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={13} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {scene.isWarning && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(239,68,68,0.95)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 3, borderColor: '#FCA5A5' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2, textAlign: 'center' }}>CAUTION</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4 }}>Cut exactly in the middle of ties!</Text>
            </Animated.View>
          )}

          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>CORD CUT SAFELY</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 6 }}>
            {['Tie 1', 'Tie 2', 'Cut'].map((name, i) => {
              const done = sceneIndex > i;
              return (
                <View key={i} style={{ 
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
                  backgroundColor: done ? 'rgba(16,185,129,0.9)' : (sceneIndex === i && scene.isWarning ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.15)'),
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
                  backgroundColor: getButtonColor(), borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12,
                  borderBottomWidth: 4, borderBottomColor: getButtonBorder(),
                  shadowColor: getButtonColor(), shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12,
                }}>
                <View style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={scene.icon} style={{ width: 22, height: 22 }} resizeMode="contain" />
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 1.5 }}>
                  {scene.actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={13} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Cord tied securely and cut! The baby is fully separated." 
          onComplete={() => { setShowSuccess(false); markStepComplete(13); }} />
      )}
    </View>
  );
}
