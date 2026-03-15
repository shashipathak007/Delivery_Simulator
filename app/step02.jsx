import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeInUp, SlideInRight, ZoomIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  {
    id: 'clean_bed',
    image: require('../assets/images/CleanBed.png'),
    instruction: 'The bed is clean. Now lay the plastic sheet to protect against fluids.',
    actionLabel: 'LAY PLASTIC SHEET',
    tipText: 'Plastic protects mattress from fluids during delivery.',
  },
  {
    id: 'plastic_on',
    image: require('../assets/images/CovewithPlastics.png'),
    instruction: 'Plastic sheet placed! Now cover with a clean sheet.',
    actionLabel: 'COVER WITH CLEAN SHEET',
    tipText: 'The clean sheet goes on top of plastic for hygiene.',
  },
  {
    id: 'sheet_on',
    image: require('../assets/images/CoverWithSheet.png'),
    instruction: 'Sheet is on! Finally, place a towel for absorbing fluids.',
    actionLabel: 'ADD TOWEL ON TOP',
    tipText: 'Towels absorb fluids and provide a soft surface.',
  },
  {
    id: 'towel_on',
    image: require('../assets/images/AddTowel.png'),
    instruction: 'All layers placed correctly! Bed is ready.',
    actionLabel: null,
    tipText: 'Layer order: Plastic → Sheet → Towel.',
  },
];

export default function Step02() {
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
    }, 300);
  }, [sceneIndex, transitioning, isDone]);

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen background */}
      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View 
            key={s.id} 
            entering={FadeIn.duration(600)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
          >
            <ImageBackground source={s.image} style={{ flex: 1 }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      {/* Dark overlays */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 310, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.65)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={2} score={score} instruction="" />

        {/* Center badge */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{
              backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14,
              borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0',
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>BED READY</Text>
            </Animated.View>
          )}
        </View>

        {/* Bottom area */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          {/* Layer order progress */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 8 }}>
            {['Plastic', 'Sheet', 'Towel'].map((name, i) => (
              <View key={i} style={{ 
                paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14,
                backgroundColor: sceneIndex > i ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.15)',
                borderWidth: 1.5, borderColor: sceneIndex > i ? '#A7F3D0' : 'rgba(255,255,255,0.2)',
              }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 }}>{name}</Text>
              </View>
            ))}
          </View>

          {/* Instruction */}
          <Animated.View 
            key={`instr-${sceneIndex}`}
            entering={SlideInRight.duration(400)} 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18,
              marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>
              {scene.instruction}
            </Text>
            {scene.tipText && (
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                {scene.tipText}
              </Text>
            )}
          </Animated.View>

          {/* Action button */}
          {scene.actionLabel && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <TouchableOpacity 
                onPress={handleAction}
                disabled={transitioning}
                activeOpacity={0.85}
                style={{
                  backgroundColor: transitioning ? '#6B7280' : '#2563EB',
                  borderRadius: 18, paddingVertical: 18, alignItems: 'center',
                  borderBottomWidth: 4, borderBottomColor: transitioning ? '#4B5563' : '#1D4ED8',
                  shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4, shadowRadius: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>
                  {scene.actionLabel}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={2} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay 
          message="Bed layered correctly! Plastic → Sheet → Towel. Ready for positioning." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(2);
          }} 
        />
      )}
    </View>
  );
}
