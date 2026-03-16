import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const FACTS = [
  "Skin-to-skin contact regulates the baby's heart rate.",
  "Early latching helps the uterus contract.",
  "Colostrum provides essential antibodies.",
  "Don't force — babies instinctively find the breast.",
];

const scenes = [
  { id: 'nursing', image: require('../assets/images/Baby_On_MothersChest.png') },
];

export default function Step17() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [timeLeft, setTimeLeft] = useState(15);
  const [factIndex, setFactIndex] = useState(0);
  const [isLatching, setIsLatching] = useState(false);
  const isDone = timeLeft === 0;

  useEffect(() => {
    let timer;
    if (isLatching && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((p) => p - 1);
        if (timeLeft % 4 === 0) setFactIndex((p) => (p + 1) % FACTS.length);
      }, 300);
    } else if (isLatching && timeLeft === 0) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
      addScore(100);
      setTimeout(() => {
        markStepComplete(17);
        router.push('/complete');
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isLatching, timeLeft]);

  const handleLatch = () => {
    if (isLatching) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    setIsLatching(true);
  };

  return (
    <GameStep step={17} score={score} scenes={scenes} sceneIndex={0} isDone={isDone} showConfetti={isDone}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {isLatching && timeLeft > 0 && (
          <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(236,72,153,0.95)', paddingHorizontal: 36, paddingVertical: 20, borderRadius: 24, borderWidth: 3, borderColor: '#F9A8D4', alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 15 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>NURSING TIME</Text>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 36, letterSpacing: 2, marginTop: 4 }}>{timeLeft}m</Text>
            </View>
          </Animated.View>
        )}
        {isDone && (
          <Animated.View entering={BounceIn} style={{ 
            backgroundColor: 'rgba(16,185,129,0.95)', 
            paddingHorizontal: 36, paddingVertical: 20, 
            borderRadius: 28, 
            borderWidth: 2, borderColor: '#A7F3D0', 
            shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 20, 
            alignItems: 'center' 
          }}>
            <Text style={{ color: '#A7F3D0', fontWeight: '800', fontSize: 12, letterSpacing: 3, marginBottom: 4 }}>SIMULATION END</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 22, letterSpacing: 1 }}>SUCCESSFUL BIRTH</Text>
          </Animated.View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <Animated.View key={`fact-${factIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 14 }}>
          <Text style={{ color: '#F9A8D4', fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 2, marginBottom: 6 }}>DID YOU KNOW?</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 24, fontStyle: 'italic' }}>"{FACTS[factIndex]}"</Text>
        </Animated.View>
        {!isLatching && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity onPress={handleLatch} activeOpacity={0.85}
              style={{ backgroundColor: '#EC4899', borderRadius: 18, paddingVertical: 20, alignItems: 'center', shadowColor: '#EC4899', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }}>BEGIN FIRST FEEDING</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
