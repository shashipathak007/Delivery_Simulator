import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'baby', name: 'Baby', icon: require('../assets/images/baby.png'), type: 'image' },
];

export default function Step17() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [babyFed, setBabyFed] = useState(false);
  const [timer, setTimer] = useState(30);
  const [factIndex, setFactIndex] = useState(0);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const completedRef = useRef(false);

  const facts = [
    "Colostrum is the first milk, full of antibodies.",
    "Early breastfeeding helps the uterus contract.",
    "Skin-to-skin contact regulates baby's temperature."
  ];

  const heartScale = useSharedValue(1);

  useEffect(() => {
    let interval;
    if (babyFed && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 300); 
      
      heartScale.value = withRepeat(
          withSequence(withTiming(1.3, { duration: 500 }), withTiming(1, { duration: 500 })),
          -1,
          true
      );
    } else if (babyFed && timer === 0 && !completedRef.current) {
      completedRef.current = true;
      addScore(100);
      setTimeout(() => setShowSuccess(true), 1200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [babyFed, timer]);

  useEffect(() => {
    if (timer % 10 === 0 && timer !== 30 && babyFed) {
      setFactIndex(i => (i + 1) % facts.length);
    }
  }, [timer]);

  const handleProximity = (itemId, posX, posY) => {
    const isOverChest = posY > 200 && posY < 550;
    setActiveDropZone(prev => isOverChest ? 'chest' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverChest = posY > 200 && posY < 550;

    if (isOverChest && itemId === 'baby' && !babyFed) {
      setBabyFed(true);
      setActiveDropZone(null);
      return true;
    }
    return false;
  };

  const heartStyle = useAnimatedStyle(() => ({
      transform: [{ scale: heartScale.value }],
      opacity: babyFed ? 1 : 0
  }));

  return (
    <View className="flex-1 bg-pink-50">
      <StepHeader 
        step={17} 
        score={score}
        instruction={!babyFed ? "Position the baby for the first feeding" : `Feeding in progress... (${timer}min units)`} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60 relative">
        <DropZone id="chest" activeZoneId={activeDropZone} style={{ width: 340, height: 440 }}>
          <View className="items-center justify-center">
             <Image 
                source={require('../assets/images/mother.png')}
                style={{ width: 340, height: 340 }}
                resizeMode="contain"
             />
             
             {babyFed && (
               <Animated.View entering={ZoomIn} style={{ position: 'absolute', top: 80, left: 40, zIndex: 10 }}>
                 <View className="bg-pink-100 rounded-full w-28 h-40 items-center justify-center shadow-2xl border-4 border-white" style={{ transform: [{ rotate: '-35deg' }] }}>
                    <Image source={require('../assets/images/baby.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
                 </View>
               </Animated.View>
             )}

             <Animated.View style={[heartStyle, { position: 'absolute', top: 40, right: 60, zIndex: 20 }]}>
                <Text className="text-6xl">❤️</Text>
             </Animated.View>
          </View>
        </DropZone>

        {babyFed && timer > 0 && (
          <Animated.View entering={FadeIn} className="absolute bottom-[-10] bg-white/95 p-6 rounded-[35px] shadow-2xl border-4 border-pink-100 w-[350px]">
            <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-3">💡</Text>
                <Text className="font-black text-pink-700 text-lg uppercase tracking-widest">Medical Fact</Text>
            </View>
            <Text className="text-gray-800 leading-6 text-base font-bold italic">"{facts[factIndex]}"</Text>
            <View className="mt-4 h-1 bg-pink-100 rounded-full overflow-hidden">
                 <View className="h-full bg-pink-500" style={{ width: `${(30 - timer) / 30 * 100}%` }} />
            </View>
          </Animated.View>
        )}
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={babyFed ? ['baby'] : []}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="First feeding successful! Mother and baby are bonding." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(17);
          }} 
        />
      )}

      <StepNavigation currentStep={17} />
    </View>
  );
}
