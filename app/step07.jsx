import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  SlideInRight,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const BASE_IMAGE = require('../assets/images/Pregnent_Mother_In_Bed.jpg');

export default function Step07() {
  const { addScore, score, markStepComplete } = useGame();
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState('tap');
  const [cycles, setCycles] = useState(0);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.2);

  const scenes = useMemo(() => [{ id: 'breathing', image: BASE_IMAGE }], []);

  const handleBreathingComplete = useCallback(() => {
    addScore(100);
    setTimeout(() => markStepComplete(7), 1500);
  }, [addScore, markStepComplete]);

  const startBreathing = () => {
    if (isBreathing) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }

    setIsBreathing(true);
    setBreathePhase('in');

    const cycleDuration = 4000;

    const runCycle = (cycleCount) => {
      if (cycleCount >= 3) {
        handleBreathingComplete();
        return;
      }

      // Switch to EXHALE exactly when inhale ends — no gap
      setTimeout(() => {
        setBreathePhase('out');
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
      }, cycleDuration);

      // Switch back to INHALE exactly when exhale ends — no gap
      setTimeout(() => {
        const next = cycleCount + 1;
        setCycles(next);
        if (next < 3) {
          setBreathePhase('in');
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
        }
        runCycle(next);
      }, cycleDuration * 2);
    };

    runCycle(0);

    // Ring expands on inhale, contracts on exhale
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: cycleDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: cycleDuration, easing: Easing.inOut(Easing.ease) })
      ),
      3,
      false
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: cycleDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: cycleDuration, easing: Easing.inOut(Easing.ease) })
      ),
      3,
      false
    );
  };

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const isDone = cycles >= 3;

  const phaseColor = breathePhase === 'in'
    ? '#3B82F6'   // blue for inhale
    : breathePhase === 'out'
      ? '#8B5CF6' // purple for exhale
      : '#2563EB'; // default

  const phaseBorder = breathePhase === 'out' ? '#DDD6FE' : '#BFDBFE';
  const phaseShadow = breathePhase === 'out' ? '#8B5CF6' : '#3B82F6';
  const ringColor = breathePhase === 'out'
    ? 'rgba(139,92,246,0.45)'
    : 'rgba(96,165,250,0.45)';

  return (
    <GameStep
      step={7}
      score={score}
      scenes={scenes}
      sceneIndex={0}
      isDone={isDone}
      showConfetti={isDone}
      transitionDuration={0}
    >
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 0 }} pointerEvents="box-none">
        {!isDone && (
          <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>

            {/* Outer animated ring */}
            <Animated.View
              pointerEvents="none"
              style={[
                animatedRingStyle,
                {
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  borderRadius: 90,
                  backgroundColor: ringColor,
                },
              ]}
            />

            {/* Second softer ring for depth */}
            <Animated.View
              pointerEvents="none"
              style={[
                animatedRingStyle,
                {
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: ringColor,
                  opacity: 0.3,
                },
              ]}
            />

            {/* Main circle button */}
            <TouchableOpacity
              onPress={startBreathing}
              disabled={isBreathing}
              activeOpacity={0.85}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: phaseColor,
                borderWidth: 4,
                borderColor: phaseBorder,
                shadowColor: phaseShadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: breathePhase === 'tap' ? 20 : 22,
                fontWeight: '900',
                letterSpacing: 2,
                textAlign: 'center',
              }}>
                {breathePhase === 'tap' ? 'START' : breathePhase === 'in' ? 'INHALE' : 'EXHALE'}
              </Text>

              {isBreathing && (
                <Text style={{
                  color: '#E0F2FE',
                  fontSize: 12,
                  fontWeight: '800',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                  {Math.min(cycles + 1, 3)}/3
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Instruction card */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View
          entering={SlideInRight.duration(400)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 24,
            padding: 22,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <Text style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '900',
            textAlign: 'center',
            letterSpacing: 1,
            marginBottom: 10,
          }}>
            GUIDED BREATHING
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: 22,
          }}>
            {breathePhase === 'in'
              ? '🫁 Breathe IN slowly… expand your lungs.'
              : breathePhase === 'out'
                ? '💨 Breathe OUT gently… release the tension.'
                : 'Tap START and breathe with the circle to manage pain.'}
          </Text>
        </Animated.View>
      </View>
    </GameStep>
  );
}