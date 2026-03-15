import React, { useState } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, useSharedValue, runOnJS, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'hand', name: 'Massage Hand', icon: require('../assets/images/wash_hands.png'), type: 'image' },
];

export default function Step15() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [handPlaced, setHandPlaced] = useState(false);
  const [isFirm, setIsFirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const progress = useSharedValue(0);
  const circleRotation = useSharedValue(0);

  const massageGesture = Gesture.Pan()
    .enabled(handPlaced && !isFirm)
    .onUpdate((e) => {
      if (progress.value >= 100) return;
      const velocity = Math.abs(e.velocityX) + Math.abs(e.velocityY);
      const inc = velocity > 50 ? velocity / 3000 : 0;
      if (inc > 0) {
        progress.value = Math.min(progress.value + inc * 100, 100);
        circleRotation.value += inc * 10;
        if (progress.value >= 100) {
          runOnJS(handleMassageComplete)();
        }
      }
    });

  const handleMassageComplete = () => {
    setIsFirm(true);
    addScore(100);
    setTimeout(() => setShowSuccess(true), 1200);
  };

  const handleProximity = (itemId, posX, posY) => {
    const isOverAbdomen = posY > 250 && posY < 600;
    setActiveDropZone(prev => isOverAbdomen ? 'abdomen' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverAbdomen = posY > 250 && posY < 600;

    if (isOverAbdomen && itemId === 'hand' && !handPlaced) {
      setHandPlaced(true);
      setActiveDropZone(null);
      return true;
    }
    return false;
  };

  const ringStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${circleRotation.value}deg` }],
      opacity: handPlaced ? 1 : 0
  }));

  const barStyle = useAnimatedStyle(() => ({
      width: `${progress.value}%`,
      backgroundColor: progress.value < 100 ? '#F97316' : '#22C55E'
  }));

  return (
    <View className="flex-1 bg-red-50">
      <StepHeader 
        step={15} 
        score={score}
        instruction={!handPlaced ? "Place hand on abdomen to control bleeding" : "Rub in a circular motion firmly!"} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60">
        
        {handPlaced && (
          <Animated.View entering={FadeIn} className="w-full mb-10 items-center">
            <Text className="text-orange-800 font-black text-[10px] tracking-widest mb-2 uppercase">Uterus Firmness</Text>
            <View className="w-full h-3 bg-red-100 rounded-full overflow-hidden border border-red-200">
               <Animated.View style={[barStyle]} className="h-full" />
            </View>
            <Text className="text-[10px] text-red-500 font-bold mt-2 uppercase">{!isFirm ? 'Massaging...' : 'FIRM & SECURE'}</Text>
          </Animated.View>
        )}

        <DropZone id="abdomen" activeZoneId={activeDropZone} style={{ width: 320, height: 350 }}>
            <View className="items-center justify-center">
                <Image 
                    source={require('../assets/images/mother.png')}
                    style={{ width: 340, height: 340 }}
                    resizeMode="contain"
                />

                {handPlaced && (
                  <GestureDetector gesture={massageGesture}>
                    <Animated.View className="absolute z-50 items-center justify-center">
                        <Animated.View style={[ringStyle]} className="w-48 h-48 rounded-full border-4 border-dashed border-orange-400 opacity-40" />
                        <View className="absolute items-center justify-center">
                           <Image source={require('../assets/images/wash_hands.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
                           <Text className="text-[10px] font-black text-orange-900 mt-2 bg-orange-200 px-3 py-1 rounded-full uppercase">Move in Circles</Text>
                        </View>
                    </Animated.View>
                  </GestureDetector>
                )}
            </View>
        </DropZone>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={handPlaced ? ['hand'] : []}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Excellent work! The uterus is firm and bleeding is controlled." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(15);
          }} 
        />
      )}

      <StepNavigation currentStep={15} />
    </View>
  );
}
