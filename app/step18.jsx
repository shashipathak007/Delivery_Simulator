import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'mom', name: 'Mother', icon: require('../assets/images/mother.png'), type: 'image' },
  { id: 'baby', name: 'Baby', icon: require('../assets/images/baby.png'), type: 'image' },
];

export default function Step18() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [momIn, setMomIn] = useState(false);
  const [babyIn, setBabyIn] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [driving, setDriving] = useState(false);
  
  const ambX = useSharedValue(0);

  const handleProximity = (itemId, posX, posY) => {
    if (posX > 60 && posX < 340 && posY > 200 && posY < 550) {
      setActiveDropZone('amb');
    } else {
      setActiveDropZone(null);
    }
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverAmb = posX > 60 && posX < 340 && posY > 200 && posY < 550;

    if (isOverAmb) {
      if (itemId === 'mom' && !momIn) {
        setMomIn(true);
        addScore(50);
        setActiveDropZone(null);
        return true;
      }
      if (itemId === 'baby' && momIn && !babyIn) {
        setBabyIn(true);
        addScore(50);
        setActiveDropZone(null);
        return true;
      }
    }
    return false;
  };

  const handleGo = () => {
    markStepComplete(18);
    setDriving(true);
    ambX.value = withTiming(600, { duration: 2000, easing: Easing.in(Easing.exp) }, () => {
      runOnJS(router.push)('/complete');
    });
  };

  const ambStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ambX.value }]
  }));

  const allIn = momIn && babyIn;
  const usedItems = [momIn && 'mom', babyIn && 'baby'].filter(Boolean);
  const lockedItems = !momIn ? ['baby'] : [];

  return (
    <View className="flex-1 bg-blue-100/30">
      <StepHeader 
        step={18} 
        score={score}
        instruction={!momIn ? "Help the mother onto the ambulance" : !babyIn ? "Now hand the baby to the medical team" : "Everyone is safe! Ready to go?"} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60 relative">
        <Animated.View style={[ambStyle]} className="items-center z-10">
           <DropZone id="amb" activeZoneId={activeDropZone} style={{ width: 320, height: 280 }}>
               <View className="items-center justify-center">
                   <Text className="text-[140px] z-0">🚑</Text>
                   
                   {/* Characters inside ambulance windows */}
                   <View className="absolute top-[80px] left-[60px] flex-row space-x-6 z-10">
                      {momIn && (
                          <Animated.View entering={ZoomIn}>
                               <View className="bg-white/40 w-16 h-16 rounded-full items-center justify-center border-2 border-white/60">
                                   <Image source={require('../assets/images/mother.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
                               </View>
                          </Animated.View>
                      )}
                      {babyIn && (
                          <Animated.View entering={ZoomIn}>
                               <View className="bg-white/40 w-12 h-12 rounded-full items-center justify-center border-2 border-white/60 mt-4">
                                   <Image source={require('../assets/images/baby.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
                               </View>
                          </Animated.View>
                      )}
                   </View>
               </View>
           </DropZone>
        </Animated.View>

        {allIn && !driving && (
          <Animated.View entering={FadeIn.delay(800)} className="absolute bottom-[-30]">
            <TouchableOpacity 
              onPress={handleGo}
              activeOpacity={0.8}
              className="bg-green-500 py-5 px-20 rounded-full shadow-2xl border-b-8 border-green-700 items-center justify-center"
            >
              <Text className="text-white text-4xl font-black tracking-widest italic">GO!</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {!allIn && (
            <View className="absolute bottom-[-20] bg-white/40 px-6 py-2 rounded-full">
                 <Text className="text-blue-800 font-bold text-xs uppercase tracking-widest">Safe Passage to Hospital</Text>
            </View>
        )}
      </View>

      {!allIn && (
        <ItemTray 
          items={TRAY_ITEMS} 
          usedItems={usedItems}
          lockedItems={lockedItems}
          onDrop={handleDrop}
          onProximity={handleProximity} 
        />
      )}

      <StepNavigation currentStep={18} />
    </View>
  );
}
