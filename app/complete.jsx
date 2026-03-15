import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Complete() {
  const router = useRouter();
  const { score, resetGame } = useGame();
  const { resetInventory } = useInventory();

  const trophyScale = useSharedValue(0.5);
  const trophyRotate = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Trophy animation
    trophyScale.value = withTiming(1, { duration: 1000, easing: Easing.bounce });
    trophyRotate.value = withRepeat(
      withSequence(
        withTiming(-0.1, { duration: 200 }),
        withTiming(0.1, { duration: 200 })
      ),
      -1,
      true
    );
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}rad` }
    ]
  }));

  const handlePlayAgain = () => {
    resetGame();
    resetInventory();
    router.replace('/');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just safely delivered a baby in Baby Delivery Simulator and scored ${score} points! 👶🚑🏆`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50 items-center justify-center p-6">
      <Animated.View entering={SlideInDown.duration(600).springify()} className="items-center w-full">
        <Animated.View style={trophyStyle} className="mb-8">
          <Text className="text-9xl">🏆</Text>
        </Animated.View>

        <Text className="text-5xl font-extrabold text-green-600 mb-2 text-center">
          YOU DID IT!
        </Text>
        <Text className="text-xl font-medium text-gray-700 mb-8 text-center px-4">
          Mother and Baby are safe and healthy!
        </Text>

        <View className="bg-white px-10 py-6 rounded-3xl shadow-lg border-4 border-yellow-300 mb-12 items-center w-full">
          <Text className="text-gray-500 font-bold uppercase tracking-widest mb-2">Final Score</Text>
          <Text className="text-6xl font-black text-yellow-500 mb-4">{score}</Text>
          <View className="flex-row space-x-2">
            {[...Array(5)].map((_, i) => (
               <Text key={i} className="text-3xl">⭐</Text>
            ))}
          </View>
        </View>

        <View className="w-full flex-col space-y-4 px-4">
            <TouchableOpacity 
              onPress={handlePlayAgain}
              className="bg-yellow-400 py-4 px-6 rounded-full shadow-[0_4px_0_rgba(202,138,4,1)] mb-4"
            >
              <Text className="text-white text-xl font-bold text-center">Play Again 🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleShare}
              className="bg-blue-400 py-4 px-6 rounded-full shadow-[0_4px_0_rgba(59,130,246,1)]"
            >
              <Text className="text-white text-xl font-bold text-center">Share Score 📱</Text>
            </TouchableOpacity>
        </View>

      </Animated.View>
      
      {/* Confetti simulation */}
      <View style={{position: 'absolute', top: 50, left: 20}}>
          <Text style={{fontSize: 30}}>🎊</Text>
      </View>
      <View style={{position: 'absolute', top: 80, right: 30}}>
          <Text style={{fontSize: 40}}>🎉</Text>
      </View>
      <View style={{position: 'absolute', top: 200, left: 50}}>
          <Text style={{fontSize: 25}}>✨</Text>
      </View>
      <View style={{position: 'absolute', top: 150, right: 60}}>
          <Text style={{fontSize: 25}}>✨</Text>
      </View>

    </SafeAreaView>
  );
}
