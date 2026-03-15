import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const ITEMS_TO_GATHER = [
  { id: '1', name: 'Soap', icon: require('../assets/images/soap.png'), type: 'image' },
  { id: '2', name: 'Gloves', icon: require('../assets/images/gloves.png'), type: 'image' },
  { id: '3', name: 'Scissors', icon: require('../assets/images/scissors.png'), type: 'image' },
  { id: '4', name: 'String 1', icon: require('../assets/images/string.png'), type: 'image' },
  { id: '5', name: 'String 2', icon: require('../assets/images/string.png'), type: 'image' },
  { id: '6', name: 'Towel', icon: require('../assets/images/towel.png'), type: 'image' },
  { id: '7', name: 'Blanket', icon: require('../assets/images/blanket.png'), type: 'image' },
  { id: '8', name: 'Bowl', icon: require('../assets/images/warm_bowl.png'), type: 'image' },
  { id: '9', name: 'Plastic', icon: require('../assets/images/plastic.png'), type: 'image' },
];

const POSITIONS = [
  { top: 20, left: 20 },
  { top: 40, left: 220 },
  { top: 140, left: 80 },
  { top: 160, left: 240 },
  { top: 260, left: 40 },
  { top: 280, left: 200 },
  { top: 380, left: 100 },
  { top: 360, left: 240 },
  { top: 480, left: 160 },
];

export default function Step04() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [collectedItems, setCollectedItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCollect = (id) => {
    if (!collectedItems.includes(id)) {
      const newCollected = [...collectedItems, id];
      setCollectedItems(newCollected);
      addScore(10);
      
      if (newCollected.length === ITEMS_TO_GATHER.length) {
        setTimeout(() => setShowSuccess(true), 800);
      }
    }
  };

  return (
    <View className="flex-1 bg-amber-50">
      <StepHeader 
        step={4} 
        score={score}
        instruction={`Gather Items! (${collectedItems.length}/9)`} 
      />

      <View className="flex-1 relative">
        {ITEMS_TO_GATHER.map((item, index) => {
          const isCollected = collectedItems.includes(item.id);
          if (isCollected) return null;
          const pos = POSITIONS[index];

          return (
            <Animated.View 
              key={item.id} 
              exiting={FadeOut.duration(300)}
              style={{ position: 'absolute', top: pos.top, left: pos.left }}
            >
              <TouchableOpacity onPress={() => handleCollect(item.id)}>
                <View className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                   <Image source={item.icon} style={{ width: 50, height: 50 }} resizeMode="contain" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <View className="h-32 bg-yellow-100 rounded-t-3xl border-t-4 border-yellow-300 items-center justify-center p-4 mb-[104px]">
        <Text className="text-xl font-bold text-yellow-800 mb-2">Emergency Bag</Text>
        <View className="flex-row flex-wrap justify-center">
          {collectedItems.map(id => {
            const item = ITEMS_TO_GATHER.find(i => i.id === id);
            return (
                <View key={id} className="mx-1">
                  <Image source={item.icon} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
            );
          })}
        </View>
      </View>

      {showSuccess && (
        <SuccessOverlay 
          message="All items gathered!" 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(4);
          }} 
        />
      )}

      <StepNavigation currentStep={4} />
    </View>
  );
}
