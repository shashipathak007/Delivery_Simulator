import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeOut, FadeInUp, SlideInRight, ZoomIn,
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    instruction: 'This room is messy and unsafe for giving birth. Tap the screen to begin.',
    actionLabel: null,
    interactZone: { top: 0, left: 0, width: '100%', height: '100%' },
    interactType: 'tap'
  },
  {
    id: 'close_windows',
    image: require('../assets/images/Background at first .png'),
    instruction: 'Close all windows to control temperature. Tap the window to close it.',
    actionLabel: null,
    interactZone: { top: '10%', left: '0%', width: '30%', height: '50%' },
    interactType: 'tap'
  },
  {
    id: 'windows_closed',
    image: require('../assets/images/Closewindow.png'),
    instruction: 'Windows closed! Now tap the light to turn it on.',
    actionLabel: null,
    interactZone: { top: '25%', left: '45%', width: '15%', height: '15%' },
    interactType: 'tap'
  },
  {
    id: 'lights_on',
    image: require('../assets/images/Turnlightson.png'),
    instruction: 'Room is well-lit! Now dust the bed to clean it.',
    actionLabel: null,
    interactZone: { top: '45%', left: '10%', right: '10%', bottom: '15%' },
    interactType: 'rub'
  },
  {
    id: 'room_ready',
    image: require('../assets/images/CleanBed.png'),
    instruction: 'Room is prepared! Warm, clean, and well-lit.',
    actionLabel: null,
  },
];

const PulsingIndicator = ({ icon = "gesture-tap" }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.4, { duration: 1000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.2, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.4)' }, animStyle]} />
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name={icon} size={24} color="#111" />
      </View>
    </View>
  );
};

export default function Step01() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;
  const [rubProgress, setRubProgress] = useState(0);

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;

    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setTransitioning(true);
    addScore(50);

    // Small delay for transition feel
    setTimeout(() => {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      setTransitioning(false);
      setRubProgress(0);

      if (nextIndex === SCENE_PROGRESSION.length - 1) {
        // Automatically complete the step after 1.5s delay once room is ready
        setTimeout(() => {
          markStepComplete(1);
        }, 1500);
      }
    }, 300);
  }, [sceneIndex, transitioning, isDone]);

  const handleRub = (evt) => {
    if (transitioning || isDone || scene.interactType !== 'rub') return;
    setRubProgress(prev => {
      const newProgress = prev + 1;
      if (newProgress > 15 && !transitioning) {
        // use setTimeout so we don't call state updates synchronously inside the render cycle
        // that handles the responder event
        setTimeout(() => handleAction(), 0);
      }
      return newProgress;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'LightPink' }}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen background that transitions */}
      {SCENE_PROGRESSION.map((s, i) => (
        i <= sceneIndex && (
          <Animated.View
            key={s.id}
            entering={FadeIn.duration(600)}
            style={{ position: 'absolute', top: -80, left: 0, right: 0, bottom: 0, zIndex: 1 }}
          >
            <ImageBackground
              source={s.image}
              style={{ flex: 1, width: '100%', height: '115%' }}
              resizeMode="cover"
            />

            {/* Interaction Zones */}
            {s.interactZone && s.interactType === 'tap' && (
              <TouchableOpacity
                style={{ position: 'absolute', ...s.interactZone }}
                onPress={handleAction}
                activeOpacity={0.6}
              >
                <PulsingIndicator icon="gesture-tap" />
              </TouchableOpacity>
            )}
            {s.interactZone && s.interactType === 'rub' && (
              <View
                style={{ position: 'absolute', ...s.interactZone }}
                onStartShouldSetResponder={() => true}
                onResponderMove={handleRub}
              >
                <PulsingIndicator icon="hand-wash" />
              </View>
            )}
          </Animated.View>
        )
      ))}

      {/* Dark overlay at top for header readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 2 }}
        pointerEvents="none"
      />

      {/* Dark overlay at bottom for action area */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2 }}
        pointerEvents="none"
      />

      {/* Content layer */}
      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }} pointerEvents="box-none">

        {/* Header */}
        <View pointerEvents="none">
          <StepHeader step={1} score={score} instruction="" />
        </View>

        {/* Center — Scene indicator */}
        <View pointerEvents="none" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
        <View pointerEvents="box-none" style={{ paddingHorizontal: 20, paddingBottom: 110 }}>
          {/* Instruction card */}
          <Animated.View
            key={`instr-${sceneIndex}`}
            entering={SlideInRight.duration(400)}
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 18,
              marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
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

        {sceneIndex > 0 && (
          <View pointerEvents="auto">
            <StepNavigation currentStep={1} />
          </View>
        )}
      </SafeAreaView>

      {/* No more success popups per user request */}
    </View>
  );
}
