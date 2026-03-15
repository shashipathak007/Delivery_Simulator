import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'leftHand', name: 'Left Hand', icon: require('../assets/images/left_hand.png'), type: 'image' },
  { id: 'rightHand', name: 'Right Hand', icon: require('../assets/images/right_hand.png'), type: 'image' },
];

export default function Step09() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [leftPlaced, setLeftPlaced] = useState(false);
  const [rightPlaced, setRightPlaced] = useState(false);
  const [checkingCord, setCheckingCord] = useState(false);
  const [cordFound, setCordFound] = useState(false);
  const [cordLoosened, setCordLoosened] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const bothHandsPlaced = leftPlaced && rightPlaced;

  const handleProximity = (itemId, posX, posY) => {
    const isOverLeft = posX < 200 && posY > 300 && posY < 600;
    const isOverRight = posX > 200 && posY > 300 && posY < 600;
    
    if (itemId === 'leftHand' && isOverLeft) setActiveDropZone('left');
    else if (itemId === 'rightHand' && isOverRight) setActiveDropZone('right');
    else setActiveDropZone(null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverLeft = posX < 200 && posY > 300 && posY < 600;
    const isOverRight = posX > 200 && posY > 300 && posY < 600;

    if (itemId === 'leftHand' && isOverLeft && !leftPlaced) {
      setLeftPlaced(true);
      addScore(25);
      setActiveDropZone(null);
      return true;
    }
    if (itemId === 'rightHand' && isOverRight && !rightPlaced) {
      setRightPlaced(true);
      addScore(25);
      setActiveDropZone(null);
      return true;
    }
    return false;
  };

  const handleCheckCord = () => {
    setCheckingCord(true);
    setTimeout(() => {
        setCordFound(true);
        addScore(50);
    }, 1500);
  };

  const handleLoosenCord = () => {
    setCordLoosened(true);
    addScore(50);
    setTimeout(() => setShowSuccess(true), 1200);
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={9} 
        score={score}
        instruction={!bothHandsPlaced ? "Place both hands to support the head" : !checkingCord ? "Hands placed! Now check for umbilical cord." : cordFound && !cordLoosened ? "WARNING: Cord around neck! Loosen it gently." : "Monitoring baby..."} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60 relative">
        <View className="w-80 h-96 items-center justify-center bg-white/40 rounded-[60px] border-4 border-white/60 relative">
           
           {/* Baby Head */}
           <View className="items-center justify-center">
               <View className="w-32 h-32 bg-[#FFDBAC] rounded-full border-4 border-[#E0AC69] items-center justify-center shadow-xl">
                    <View className="flex-row space-x-4 mb-2">
                        <View className="w-2 h-2 bg-black rounded-full" />
                        <View className="w-2 h-2 bg-black rounded-full" />
                    </View>
                    <View className="w-8 h-1 bg-pink-300 rounded-full" />
               </View>
               
               {cordFound && !cordLoosened && (
                   <Animated.View entering={ZoomIn} className="absolute inset-0 items-center justify-center">
                        <Svg height="140" width="140" viewBox="0 0 100 100">
                            <Circle cx="50" cy="50" r="45" fill="none" stroke="#93C5FD" strokeWidth="8" strokeDasharray="10 5" />
                        </Svg>
                   </Animated.View>
               )}
           </View>

           {/* Left Hand */}
           <DropZone id="left" activeZoneId={activeDropZone} style={{ position: 'absolute', left: 10, top: 100, width: 100, height: 200 }}>
               {leftPlaced && (
                   <Animated.View entering={FadeIn} style={{ transform: [{ rotate: '45deg' }] }}>
                       <Image source={require('../assets/images/left_hand.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
                   </Animated.View>
               )}
           </DropZone>

           {/* Right Hand */}
           <DropZone id="right" activeZoneId={activeDropZone} style={{ position: 'absolute', right: 10, top: 100, width: 100, height: 200 }}>
               {rightPlaced && (
                   <Animated.View entering={FadeIn} style={{ transform: [{ rotate: '-45deg' }] }}>
                       <Image source={require('../assets/images/right_hand.png')} style={{ width: 80, height: 80, transform: [{ scaleX: -1 }] }} resizeMode="contain" />
                   </Animated.View>
               )}
           </DropZone>
        </View>

        {bothHandsPlaced && !checkingCord && (
            <Animated.View entering={FadeIn} className="mt-10">
                <TouchableOpacity onPress={handleCheckCord} className="bg-yellow-400 py-4 px-10 rounded-full shadow-lg border-b-4 border-yellow-600">
                    <Text className="text-white font-black text-lg">CHECK FOR CORD 🔍</Text>
                </TouchableOpacity>
            </Animated.View>
        )}

        {cordFound && !cordLoosened && (
            <Animated.View entering={ZoomIn} className="mt-10">
                <TouchableOpacity onPress={handleLoosenCord} className="bg-orange-500 py-4 px-10 rounded-full shadow-lg border-b-4 border-orange-700">
                    <Text className="text-white font-black text-lg">LOOSEN CORD 🪢</Text>
                </TouchableOpacity>
            </Animated.View>
        )}
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={[leftPlaced && 'leftHand', rightPlaced && 'rightHand'].filter(Boolean)}
        onDrop={handleDrop}
        onProximity={handleProximity} 
        lockedItems={(checkingCord || cordFound) ? ['leftHand', 'rightHand'] : []}
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Head supported and cord cleared! You're doing great." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(9);
          }} 
        />
      )}

      <StepNavigation currentStep={9} />
    </View>
  );
}
