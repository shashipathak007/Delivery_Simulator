import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StepHeader({ step, totalSteps = 18, score = 0, instruction }) {
  const progress = (step / totalSteps) * 100;

  return (
    <SafeAreaView edges={['top']} className="bg-blue-50 px-4 pt-2 pb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-700">Step {step}/{totalSteps}</Text>
        <Text className="text-lg font-bold text-yellow-600">🏆 {score}</Text>
      </View>
      
      {/* Progress Bar */}
      <View className="h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
        <View 
          className="h-full bg-blue-400 rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </View>

      {/* Instruction Card */}
      <View className="bg-white rounded-3xl p-4 items-center shadow-sm border border-blue-100">
        <Text className="text-xl font-bold text-gray-800 text-center">
          {instruction}
        </Text>
      </View>
    </SafeAreaView>
  );
}
