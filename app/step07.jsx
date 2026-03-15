import React, { useState, useEffect } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing
} from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

export default function Step07() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [breaths, setBreaths] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 2000 }),
        withTiming(0.8, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    setIsPressing(true);
  };

  const handlePressOut = () => {
    setIsPressing(false);
    if (!showSuccess) {
      const newBreaths = breaths + 1;
      setBreaths(newBreaths);
      addScore(30);
      if (newBreaths >= 3) {
        setTimeout(() => setShowSuccess(true), 500);
      }
    }
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={7} 
        score={score}
        instruction={`Breathe with mother! Hold the button (${breaths}/3)`} 
      />

      <View className="flex-1 items-center justify-center mb-60">
        <View className="bg-white w-48 h-48 rounded-full items-center justify-center shadow-xl border-4 border-blue-200 mb-12">
            <Text className="text-8xl">
            {isPressing ? '😮' : '😌'}
            </Text>
        </View>

        <View className="items-center justify-center">
          <Animated.View 
            style={[animatedRingStyle, { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#60A5FA' }]} 
          />
          <TouchableHighlight 
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            underlayColor="#1E40AF"
            style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 }}
          >
            <Text className="text-white text-2xl font-black">HOLD</Text>
          </TouchableHighlight>
        </View>
        <Text className="text-blue-900/60 mt-12 text-center px-10 font-bold italic leading-5">
          "Deep slow breaths help the mother stay calm and manage the contraction wave."
        </Text>
      </View>

      {showSuccess && (
        <SuccessOverlay 
          message="Good breathing! You're helping her stay controlled." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(7);
          }} 
        />
      )}

      <StepNavigation currentStep={7} />
    </View>
  );
}
