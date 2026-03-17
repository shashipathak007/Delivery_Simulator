import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  SlideInRight,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const scenes = [
  { id: 'breathing', image: require('../assets/images/Pregnent_Mother_In_Bed.jpg') },
];

export default function Step07() {
  const { addScore, score, markStepComplete } = useGame();
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState('tap');
  const [cycles, setCycles] = useState(0);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.2);

  // ✅ Safe JS callback — called via runOnJS from the UI thread
  const handleBreathingComplete = useCallback(() => {
    addScore(100);
    setTimeout(() => markStepComplete(7), 1500);
  }, [addScore, markStepComplete]);

  const startBreathing = () => {
    if (isBreathing) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setIsBreathing(true);
    setBreathePhase('in');

    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      3,
      false,
      (finished) => {
        'worklet';
        if (finished) runOnJS(handleBreathingComplete)(); // ✅ fixed
      }
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      3,
      false
    );
  };

  useEffect(() => {
    if (!isBreathing) return;
    let outTimer, cycleTimer;
    const runCycle = () => {
      setBreathePhase('in');
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
      outTimer = setTimeout(() => {
        setBreathePhase('out');
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
      }, 4000);
      cycleTimer = setTimeout(() => setCycles(p => p + 1), 8000);
    };
    runCycle();
    const interval = setInterval(runCycle, 8000);
    return () => { clearTimeout(outTimer); clearTimeout(cycleTimer); clearInterval(interval); };
  }, [isBreathing]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const isDone = cycles >= 3;

  return (
    <GameStep step={7} score={score} scenes={scenes} sceneIndex={0} isDone={isDone} showConfetti={isDone}>
      {/* Place START button below header (not centered) */}
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 150 }} pointerEvents="box-none">
        {!isDone && (
          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(96,165,250,0.18)', // translucent light-blue container
              borderRadius: 36,
              borderWidth: 1.5,
              borderColor: 'rgba(191,219,254,0.55)',
              padding: 16,
            }}
          >
            {/* Soft pulsing ring behind the main circle */}
            <Animated.View
              style={[
                animatedRingStyle,
                {
                  position: 'absolute',
                  width: 170,
                  height: 170,
                  borderRadius: 85,
                  backgroundColor: 'rgba(96,165,250,0.65)',
                },
              ]}
              pointerEvents="none"
            />

            <TouchableOpacity
              onPress={startBreathing}
              disabled={isBreathing}
              activeOpacity={0.8}
              style={{
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: isBreathing ? '#3B82F6' : '#2563EB',
                borderWidth: 4,
                borderColor: '#BFDBFE',
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 2, textAlign: 'center' }}>
                  {breathePhase === 'tap' ? 'START' : breathePhase === 'in' ? 'INHALE' : 'EXHALE'}
                </Text>
                {isBreathing && (
                  <Text style={{ color: '#E0F2FE', fontSize: 12, fontWeight: '800', textAlign: 'center' }}>
                    CYCLE {Math.min(cycles + 1, 3)}/3
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', textAlign: 'center', letterSpacing: 1, marginBottom: 8 }}>
            GUIDED BREATHING
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
            Breathe slowly with the circle to manage pain.
          </Text>
        </Animated.View>
      </View>
    </GameStep>
  );
}