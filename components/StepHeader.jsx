import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StepHeader({ step, totalSteps = 17, score = 0, instruction }) {
  const progress = (step / totalSteps) * 100;

  return (
    <SafeAreaView edges={['top']} className="px-5 pt-2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-black text-white px-3 py-1 bg-black/30 rounded-full overflow-hidden">Step {step}/{totalSteps}</Text>
        <Text className="text-lg font-black text-yellow-400 px-3 py-1 bg-black/30 rounded-full overflow-hidden">🏆 {score}</Text>
      </View>
      
      {/* Progress Bar */}
      <View className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
        <View 
          className="h-full bg-blue-400 rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </View>
    </SafeAreaView>
  );
}
