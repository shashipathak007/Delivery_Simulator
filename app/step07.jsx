import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeOut, SlideInRight, ZoomIn, 
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

export default function Step07() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState('tap'); // tap, in, out
  const [cycles, setCycles] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.2);

  const startBreathing = () => {
    if (isBreathing) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    
    setIsBreathing(true);
    setBreathePhase('in');

    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }), // Inhale
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })   // Exhale
      ), 3, false, (finished) => {
        if (finished) {
          addScore(100);
          setTimeout(() => {
            markStepComplete(7);
          }, 1500);
        }
      }
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), 3, false
    );
  };

  useEffect(() => {
    if (!isBreathing) return;

    let inTimer, outTimer, cycleTimer;
    
    const runCycle = () => {
      setBreathePhase('in');
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}

      outTimer = setTimeout(() => {
        setBreathePhase('out');
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
      }, 4000);

      cycleTimer = setTimeout(() => {
        setCycles(prev => prev + 1);
      }, 8000);
    };

    runCycle();
    const interval = setInterval(runCycle, 8000);

    return () => {
      clearTimeout(outTimer);
      clearTimeout(cycleTimer);
      clearInterval(interval);
    };
  }, [isBreathing]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      <ImageBackground source={require('../assets/images/PregnentMother.png')} style={{ flex: 1, position: 'absolute', top: -80, left: 0, right: 0, bottom: 0, zIndex: 1 }} resizeMode="cover" />

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
        <StepHeader step={7} score={score} instruction="" />

        {/* Central Breathing UI */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          
          <Animated.View style={[animatedRingStyle, {
            position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#60A5FA',
          }]} />

          <TouchableOpacity
            onPress={startBreathing}
            disabled={isBreathing}
            activeOpacity={0.8}
            style={{
              width: 130, height: 130, borderRadius: 65,
              backgroundColor: isBreathing ? '#3B82F6' : '#2563EB',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 4, borderColor: '#BFDBFE',
              shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 2 }}>
              {breathePhase === 'tap' ? 'START' : breathePhase === 'in' ? 'INHALE' : 'EXHALE'}
            </Text>
            {isBreathing && (
              <Text style={{ color: '#E0F2FE', fontSize: 11, fontWeight: '800', marginTop: 4 }}>
                CYCLE {cycles + 1}/3
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 110 }}>
          <Animated.View entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', textAlign: 'center', letterSpacing: 1, marginBottom: 8 }}>
              GUIDED BREATHING
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
              Helps manage pain and oxygenate the baby during contractions. Breathe slowly with the circle.
            </Text>
          </Animated.View>
        </View>

        <StepNavigation currentStep={7} />
      </SafeAreaView>

      {/* No success popups */}
    </View>
  );
}
