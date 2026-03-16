import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const FACTS = [
  "Skin-to-skin contact regulates the baby's heart rate and temperature.",
  "Early latching helps the uterus contract and limits bleeding.",
  "Colostrum (first milk) provides essential antibodies for immunity.",
  "Do not force the baby. They often instinctively crawl to the breast.",
];

export default function Step17() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [timeLeft, setTimeLeft] = useState(15);
  const [factIndex, setFactIndex] = useState(0);
  const [isLatching, setIsLatching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (isLatching && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft % 4 === 0) {
          setFactIndex((prev) => (prev + 1) % FACTS.length);
        }
      }, 300); // Accelerated for simulation
    } else if (isLatching && timeLeft === 0) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      addScore(100);
      setShowSuccess(true);
    }
    return () => clearInterval(timer);
  }, [isLatching, timeLeft]);

  const handleLatch = () => {
    if (isLatching) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setIsLatching(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      <Animated.View entering={FadeIn.duration(500)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <ImageBackground source={require('../assets/images/PutOnMothersChest.png')} style={{ flex: 1 }} resizeMode="cover" />
      </Animated.View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.8)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }}>
        <StepHeader step={17} score={score} instruction="" />

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isLatching && timeLeft > 0 && (
            <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(236,72,153,0.95)', paddingHorizontal: 36, paddingVertical: 20, borderRadius: 24, borderWidth: 3, borderColor: '#F9A8D4', alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 15 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>NURSING TIME</Text>
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 36, letterSpacing: 2, marginTop: 4 }}>{timeLeft}m</Text>
              </View>
            </Animated.View>
          )}

          {timeLeft === 0 && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>SUCCESSFUL LATCH</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }}>
          
          <Animated.View entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ color: '#F9A8D4', fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginBottom: 6 }}>
              DID YOU KNOW?
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' }}>
              "{FACTS[factIndex]}"
            </Text>
          </Animated.View>

          {!isLatching && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <TouchableOpacity onPress={handleLatch} activeOpacity={0.85}
                style={{ 
                  backgroundColor: '#EC4899', borderRadius: 16, paddingVertical: 20, alignItems: 'center',
                  borderBottomWidth: 4, borderBottomColor: '#BE185D',
                  shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12,
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }}>
                  BEGIN FIRST FEEDING
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={17} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Simulation Complete! The mother and baby are stable and resting." 
          onComplete={() => { setShowSuccess(false); markStepComplete(17); router.push('/complete'); }} />
      )}
    </View>
  );
}
