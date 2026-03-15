import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

export default function Step10() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [leftDone, setLeftDone] = useState(false);
  const [rightDone, setRightDone] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const leftShoulderY = useSharedValue(0);
  const rightShoulderY = useSharedValue(0);

  const handleLeft = () => {
    if (!leftDone) {
      setLeftDone(true);
      leftShoulderY.value = withSpring(40);
      addScore(50);
    }
  };

  const handleRight = () => {
    if (leftDone && !rightDone) {
      setRightDone(true);
      rightShoulderY.value = withSpring(40);
      addScore(50);
      setTimeout(() => setShowSuccess(true), 1200);
    }
  };

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: leftShoulderY.value }],
    opacity: leftDone ? 1 : 0.8
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rightShoulderY.value }],
    opacity: rightDone ? 1 : leftDone ? 0.8 : 0.3
  }));

  const highlightScale = useSharedValue(1);
  React.useEffect(() => {
    highlightScale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
    );
  }, []);

  const highlightStyle = useAnimatedStyle(() => ({
      transform: [{ scale: highlightScale.value }]
  }));

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={10} 
        score={score}
        instruction={!leftDone ? "Wait for left shoulder highlight... then tap!" : !rightDone ? "Wait for right shoulder highlight... then tap!" : "Shoulders delivered! Body sliding out..."} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60">
        <View className="items-center relative w-full h-80 justify-center">
          
          {/* Left Shoulder Area */}
          <Animated.View style={[leftStyle, !leftDone ? highlightStyle : {}]} className="absolute left-[15%] top-20 z-0">
            <TouchableOpacity onPress={handleLeft} disabled={leftDone} className="items-center">
              <View className={`w-28 h-28 rounded-full items-center justify-center border-4 ${!leftDone ? 'border-yellow-400 bg-yellow-400/20' : 'border-green-500 bg-green-500/20'}`}>
                 <Text className={`text-sm font-black uppercase ${!leftDone ? 'text-yellow-700' : 'text-green-700'}`}>{leftDone ? 'DONE' : 'LEFT'}</Text>
              </View>
              {!leftDone && <Text className="text-[10px] text-yellow-600 font-bold mt-2">TAP HERE</Text>}
            </TouchableOpacity>
          </Animated.View>

          {/* Baby Center */}
          <View className="w-40 h-40 bg-[#FFDBAC] rounded-full items-center justify-center z-10 border-8 border-white shadow-2xl">
              <View className="items-center">
                <Image source={require('../assets/images/baby.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
                <Text className="text-[8px] font-bold text-[#8D5524]/40 mt-1 uppercase tracking-widest">Natural Path</Text>
              </View>
          </View>

          {/* Right Shoulder Area */}
          <Animated.View style={[rightStyle, (leftDone && !rightDone) ? highlightStyle : {}]} className="absolute right-[15%] top-20 z-0">
            <TouchableOpacity onPress={handleRight} disabled={rightDone || !leftDone} className="items-center">
              <View className={`w-28 h-28 rounded-full items-center justify-center border-4 ${leftDone && !rightDone ? 'border-yellow-400 bg-yellow-400/20' : rightDone ? 'border-green-500 bg-green-500/20' : 'border-gray-200 bg-gray-100'}`}>
                 <Text className={`text-sm font-black uppercase ${rightDone ? 'text-green-700' : leftDone ? 'text-yellow-700' : 'text-gray-400'}`}>{rightDone ? 'DONE' : 'RIGHT'}</Text>
              </View>
              {leftDone && !rightDone && <Text className="text-[10px] text-yellow-600 font-bold mt-2">TAP HERE</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View className="bg-white/80 p-5 rounded-[30px] border border-blue-100 mt-10 shadow-sm">
             <Text className="text-blue-800 text-center font-bold italic leading-5">
                "Deliver shoulders one at a time. Never pull. Let the baby slide out naturally after the shoulders are free."
             </Text>
        </View>
      </View>

      {showSuccess && (
        <SuccessOverlay 
          message="Shoulders delivered safely! The full body slides out now." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(10);
          }} 
        />
      )}

      <StepNavigation currentStep={10} />
    </View>
  );
}
