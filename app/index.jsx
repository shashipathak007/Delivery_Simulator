import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Dynamic Background Element */}
      <View className="absolute top-[-50] right-[-50] w-64 h-64 bg-pink-50 rounded-full opacity-50" />
      <View className="absolute bottom-10 left-[-30] w-48 h-48 bg-blue-50 rounded-full opacity-50" />

      <Animated.View entering={FadeInDown.delay(300).springify()} className="items-center mb-16 z-10">
        <View className="shadow-2xl">
            <View className="w-40 h-40 bg-white rounded-full items-center justify-center border-8 border-yellow-400">
                <Text className="text-8xl">👶</Text>
            </View>
        </View>
        
        <View className="mt-8 items-center">
            <Text className="text-5xl font-black text-blue-900 tracking-tighter">BabyGuide</Text>
            <Text className="text-2xl font-bold text-pink-500 uppercase tracking-[6px] mt-1">Simulator</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full z-10">
        <View className="bg-white/80 rounded-[40px] p-8 border-2 border-blue-50 shadow-sm mb-12">
          <Text className="text-xl font-black text-gray-800 text-center mb-6 uppercase tracking-widest">Training Mission</Text>
          <View className="space-y-4">
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-xs">🚑</Text>
                </View>
                <Text className="text-gray-600 font-bold">18 Emergency Steps</Text>
            </View>
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-xs">🧴</Text>
                </View>
                <Text className="text-gray-600 font-bold">Sterile Tool Handling</Text>
            </View>
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-pink-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-xs">🤝</Text>
                </View>
                <Text className="text-gray-600 font-bold">Bonding & Initial Care</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/step01')}
          activeOpacity={0.9}
          className="bg-yellow-400 rounded-full py-5 shadow-[0_6px_0_rgba(202,138,4,1)] active:mb-[-6px] active:translate-y-1"
        >
          <Animated.Text entering={SlideInRight.delay(800)} className="text-center text-white text-3xl font-black tracking-widest">
            START 🚀
          </Animated.Text>
        </TouchableOpacity>
        
        <Text className="text-center text-gray-400 mt-8 font-bold text-[10px] uppercase tracking-widest">Emergency Home Delivery Guide</Text>
      </Animated.View>
    </SafeAreaView>
  );
}
