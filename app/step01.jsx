import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, runOnJS } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';

const TRAY_ITEMS = [
  { id: 'phone', name: 'Phone', icon: require('../assets/images/phone.png'), type: 'image' },
];

export default function Step01() {
  const router = useRouter();
  const { addScore, score, markStepComplete, isStepComplete } = useGame();
  const { markItemUsed, hasItemBeenUsed } = useInventory();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callConfirmed, setCallConfirmed] = useState(false);

  const phoneUsed = hasItemBeenUsed('step01', 'phone');
  const ringScale = useSharedValue(1);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: 2 - ringScale.value,
  }));

  const startCalling = () => {
    setIsCalling(true);
    ringScale.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 1000 }),
        withTiming(1, { duration: 0 })
      ),
      5,
      false,
      () => {
        runOnJS(setCallConfirmed)(true);
      }
    );
  };

  const handleProximity = (itemId, posX, posY) => {
    const isOverHelper = posX > 150 && posY > 150 && posY < 700;
    setActiveDropZone(prev => isOverHelper ? 'helper' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverHelper = posX > 150 && posY > 150 && posY < 700;
    
    if (isOverHelper && itemId === 'phone' && !isCalling) {
      markItemUsed('step01', 'phone');
      addScore(50);
      startCalling();
      setActiveDropZone(null);
      return true;
    }
    return false;
  };

  const handleConfirmCall = () => {
    addScore(50);
    setShowSuccess(true);
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={1} 
        score={score}
        instruction={!isCalling ? "Give phone to helper to call emergency services!" : callConfirmed ? "Call confirmed! Tap to proceed." : "Calling 112... Wait for connection."} 
      />

      <View className="flex-1 flex-row items-center justify-center mb-60 px-4 relative">
        <Animated.View entering={FadeIn.delay(200)} className="w-1/2 items-center justify-center pr-2">
             <Image 
                source={require('../assets/images/mother.png')}
                style={{ width: '100%', height: 250 }}
                resizeMode="contain"
             />
        </Animated.View>

        <View className="w-1/2 items-center justify-center pl-2">
            <DropZone id="helper" activeZoneId={activeDropZone} style={{ padding: 10, width: '100%', alignItems: 'center' }}>
                <Image 
                    source={require('../assets/images/bystander.png')}
                    style={{ width: '100%', height: 280 }}
                    resizeMode="contain"
                />
                
                {isCalling && (
                    <View className="absolute top-1/2 -right-2">
                        <Animated.View style={[animatedRingStyle]} className="absolute inset-0 bg-blue-400 rounded-full" />
                        <View className="bg-blue-600 rounded-2xl p-3 shadow-lg border-2 border-white">
                           <Image source={require('../assets/images/phone.png')} style={{ width: 40, height: 60 }} resizeMode="contain" />
                        </View>
                    </View>
                )}
            </DropZone>
        </View>

        {callConfirmed && !showSuccess && (
           <Animated.View entering={ZoomIn} className="absolute inset-0 items-center justify-center z-50 bg-white/20">
               <TouchableOpacity 
                 onPress={handleConfirmCall}
                 className="bg-green-500 py-4 px-10 rounded-full shadow-xl border-b-4 border-green-700"
               >
                  <Text className="text-white font-black text-xl tracking-widest">CONFIRM CALL ✅</Text>
               </TouchableOpacity>
           </Animated.View>
        )}
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={isCalling ? ['phone'] : []}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Help is on the way! Ambulance dispatched." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(1);
          }} 
        />
      )}

      <StepNavigation currentStep={1} />
    </View>
  );
}
