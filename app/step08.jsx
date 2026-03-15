import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'towel', name: 'Towel', icon: require('../assets/images/towel.png'), type: 'image' },
];

export default function Step08() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [towelPlaced, setTowelPlaced] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProximity = (itemId, posX, posY) => {
    const isOverTarget = posY > 450 && posY < 700;
    setActiveDropZone(prev => isOverTarget ? 'target' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverTarget = posY > 450 && posY < 700;

    if (isOverTarget && itemId === 'towel' && !towelPlaced) {
      setTowelPlaced(true);
      addScore(50);
      setActiveDropZone(null);
      setTimeout(() => setShowSuccess(true), 1200);
      return true;
    }
    return false;
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={8} 
        score={score}
        instruction={!towelPlaced ? "The head is appearing! Place a towel below immediately." : "Head supported! Proceed to check the baby."} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60 relative">
        <DropZone id="target" activeZoneId={activeDropZone} style={{ width: 320, height: 400 }}>
          <View className="items-center justify-center">
             <Image 
                source={require('../assets/images/mother.png')}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
             />
             
             {/* Baby Crowning Visual */}
             <View className="absolute bottom-[40px] items-center">
                <Animated.View entering={ZoomIn} className="w-24 h-24 bg-[#FFDBAC] rounded-full border-4 border-[#E0AC69] items-center justify-center shadow-lg">
                    <View className="w-4 h-1 bg-[#8D5524]/20 rounded-full mb-1" />
                    <View className="flex-row space-x-2">
                        <View className="w-1 h-1 bg-black/20 rounded-full" />
                        <View className="w-1 h-1 bg-black/20 rounded-full" />
                    </View>
                </Animated.View>
                <Text className="text-pink-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Crowning</Text>
             </View>

             {towelPlaced && (
               <Animated.View entering={FadeIn} style={{ position: 'absolute', bottom: 15, zIndex: 10 }}>
                 <Image 
                    source={require('../assets/images/towel.png')}
                    style={{ width: 180, height: 100 }}
                    resizeMode="contain"
                 />
               </Animated.View>
             )}
          </View>
        </DropZone>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={towelPlaced ? ['towel'] : []}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Towel placed! Head supported safely." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(8);
          }} 
        />
      )}

      <StepNavigation currentStep={8} />
    </View>
  );
}
