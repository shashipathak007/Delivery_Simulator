import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeOut, FadeInUp, SlideInRight, ZoomIn,
  useSharedValue, useAnimatedStyle, withTiming, withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

// The progression: each action transitions the FULL background
const SCENE_PROGRESSION = [
  {
    id: 'start',
    image: require('../assets/images/Background at first .png'),
    instruction: 'This room is messy and unsafe. Tap the action below to begin.',
    actionLabel: 'START CLEANING',
  },
  {
    id: 'close_windows',
    image: require('../assets/images/Background at first .png'),
    instruction: 'Close all windows and doors to control temperature.',
    actionLabel: 'CLOSE WINDOWS & DOORS',
  },
  {
    id: 'windows_closed',
    image: require('../assets/images/Closewindow.png'),
    instruction: 'Windows closed! Now turn on all lights.',
    actionLabel: 'TURN ON ALL LIGHTS',
  },
  {
    id: 'lights_on',
    image: require('../assets/images/Turnlightson.png'),
    instruction: 'Room is well-lit! Now clear the bed and floor.',
    actionLabel: 'CLEAR & CLEAN THE BED',
  },
  {
    id: 'room_ready',
    image: require('../assets/images/CleanBed.png'),
    instruction: 'Room is prepared! Warm, clean, and well-lit.',
    actionLabel: null,
  },
];

export default function Step01() {
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

    // Small delay for transition feel
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

      {/* Full-screen background that transitions */}
      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View 
            key={s.id} 
            entering={FadeIn.duration(600)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
          >
            <ImageBackground
              source={s.image}
              style={{ flex: 1, width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Animated.View>
        )
      ))}

      {/* Dark overlay at top for header readability */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      
      {/* Dark overlay at bottom for action area */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.6)' }} />

      {/* Content layer */}
      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        
        {/* Header */}
        <StepHeader step={1} score={score} instruction="" />

        {/* Center — Scene indicator */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{
              backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14,
              borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0',
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>ROOM READY</Text>
            </Animated.View>
          )}
        </View>
        
        {/* Bottom action area */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          {/* Instruction card */}
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

          {/* Progress dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8 }}>
            {SCENE_PROGRESSION.slice(1).map((_, i) => (
              <View 
                key={i} 
                style={{ 
                  width: sceneIndex > i ? 24 : 10, height: 10, 
                  borderRadius: 5, 
                  backgroundColor: sceneIndex > i ? '#10B981' : 'rgba(255,255,255,0.3)',
                }} 
              />
            ))}
          </View>
        </View>

        <StepNavigation currentStep={1} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay 
          message="Room is warm, clean, and well-lit! Ready for the next phase." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(1);
          }} 
        />
      )}
    </View>
  );
}
