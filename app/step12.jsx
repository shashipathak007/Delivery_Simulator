import React, { useState } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, runOnJS, ZoomIn } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';
import * as Haptics from 'expo-haptics';

const TRAY_ITEMS = [
  { id: 'rub', name: 'Rub Back', icon: require('../assets/images/towel.png'), type: 'image' },
  { id: 'tap', name: 'Tap Foot', icon: require('../assets/images/wash_hands.png'), type: 'image' },
];

export default function Step12() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [rubCount, setRubCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [isHealthy, setIsHealthy] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const babyScale = useSharedValue(1);

  const handleProximity = (itemId, posX, posY) => {
    if (itemId === 'rub' && posY > 200 && posY < 450) {
      setActiveDropZone('back');
    } else if (itemId === 'tap' && posY >= 450 && posY < 650) {
      setActiveDropZone('feet');
    } else {
      setActiveDropZone(null);
    }
  };

  const checkCompletion = (r, t) => {
    if (r >= 3 && t >= 2 && !isHealthy) {
      setIsHealthy(true);
      animateCry();
    }
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverBack = posY > 200 && posY < 450;
    const isOverFeet = posY >= 450 && posY < 650;

    if (isOverBack && itemId === 'rub' && rubCount < 3) {
      const newRub = rubCount + 1;
      setRubCount(newRub);
      addScore(20);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      checkCompletion(newRub, tapCount);
      setActiveDropZone(null);
      return false;
    }
    if (isOverFeet && itemId === 'tap' && tapCount < 2) {
      const newTap = tapCount + 1;
      setTapCount(newTap);
      addScore(20);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      checkCompletion(rubCount, newTap);
      setActiveDropZone(null);
      return false; 
    }
    return false;
  };

  const animateCry = () => {
    babyScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 250 }),
        withTiming(1, { duration: 250 })
      ),
      6,
      true,
      () => {
        runOnJS(setShowSuccess)(true);
      }
    );
  };

  const animatedBabyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: babyScale.value }]
  }));

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={12} 
        score={score}
        instruction={rubCount < 3 ? "Stimulate breathing: Rub the baby's back (3 times)" : tapCount < 2 ? "Good! Now tap the baby's feet (2 times)" : "Baby is regularizing breathing!"} 
      />

      <View className="flex-1 items-center justify-center mb-60 relative">
        <DropZone id="back" activeZoneId={activeDropZone} style={{ width: 220, height: 180, position: 'absolute', top: 150 }} />
        <DropZone id="feet" activeZoneId={activeDropZone} style={{ width: 220, height: 180, position: 'absolute', bottom: 150 }} />

        <View className="items-center justify-center">
            <Image 
                source={require('../assets/images/mother.png')}
                style={{ width: 320, height: 320 }}
                resizeMode="contain"
            />

            <Animated.View style={[animatedBabyStyle]} className="absolute top-[80px] items-center z-10">
                <View className={`w-36 h-48 rounded-[24px] items-center justify-center ${isHealthy ? 'bg-pink-100 border-pink-400' : 'bg-[#D1E9FF] border-blue-400'} border-4 shadow-2xl`}>
                   {isHealthy ? (
                       <Animated.View entering={ZoomIn} className="items-center">
                          <Image source={require('../assets/images/baby.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
                          <View className="mt-2 bg-pink-500 px-4 py-1 rounded-full"><Text className="text-white font-black text-[10px] tracking-widest">CRYING HEALTHY</Text></View>
                       </Animated.View>
                   ) : (
                       <View className="items-center">
                          <Image source={require('../assets/images/baby.png')} style={{ width: 100, height: 100, opacity: 0.5 }} resizeMode="contain" />
                          <Text className="text-[10px] font-bold text-blue-500 mt-2">NEED STIMULATION</Text>
                       </View>
                   )}
                </View>
            </Animated.View>
        </View>

        {/* Counter UI */}
        <View className="absolute right-6 top-1/2 -translate-y-20 space-y-4">
             <View className={`p-4 rounded-3xl border-2 ${rubCount >= 3 ? 'bg-green-100 border-green-300' : 'bg-white border-blue-200'} shadow-sm items-center`}>
                 <Text className="text-xs font-black text-blue-800">BACK RUBS</Text>
                 <Text className="text-2xl font-black text-blue-900">{rubCount}/3</Text>
             </View>
             <View className={`p-4 rounded-3xl border-2 ${tapCount >= 2 ? 'bg-green-100 border-green-300' : 'bg-white border-blue-200'} shadow-sm items-center`}>
                 <Text className="text-xs font-black text-blue-800">FOOT TAPS</Text>
                 <Text className="text-2xl font-black text-blue-900">{tapCount}/2</Text>
             </View>
        </View>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={[]}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Excellent! The baby is breathing and crying healthily." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(12);
          }} 
        />
      )}

      <StepNavigation currentStep={12} />
    </View>
  );
}
