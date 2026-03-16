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

export default function Step08() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [towelPlaced, setTowelPlaced] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePlaceTowel = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setTowelPlaced(true);
    addScore(50);
    setTimeout(() => setShowSuccess(true), 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      <Animated.View entering={FadeIn.duration(600)} 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <ImageBackground source={require('../assets/images/Crowning.png')} style={{ flex: 1 }} resizeMode="cover" />
      </Animated.View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.55)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.7)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={8} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {!towelPlaced && (
            <Animated.View entering={ZoomIn} style={{ backgroundColor: 'rgba(236,72,153,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#F9A8D4' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>CROWNING</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.8 }}>Baby's head is appearing</Text>
            </Animated.View>
          )}
          {towelPlaced && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>HEAD SUPPORTED</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          <Animated.View entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>
              {towelPlaced ? "Towel placed! Head is supported and cushioned." : "The head is appearing! Place a clean towel below to support it immediately."}
            </Text>
          </Animated.View>

          {!towelPlaced && (
            <Animated.View entering={FadeInUp.delay(200)}>
              <TouchableOpacity onPress={handlePlaceTowel} activeOpacity={0.85}
                style={{ backgroundColor: '#EC4899', borderRadius: 18, paddingVertical: 18, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#BE185D',
                  shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>PLACE TOWEL BELOW HEAD</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={8} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Head supported safely! Now check for the umbilical cord." 
          onComplete={() => { setShowSuccess(false); markStepComplete(8); }} />
      )}
    </View>
  );
}
