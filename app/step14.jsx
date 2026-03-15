import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, ZoomIn, SlideInDown } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'placenta', name: 'Placenta', icon: require('../assets/images/placenta.png'), type: 'image' },
];

export default function Step14() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [timer, setTimer] = useState(3);
  const [placentaReady, setPlacentaReady] = useState(false);
  const [placentaStored, setPlacentaStored] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && !placentaReady) {
      setPlacentaReady(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, placentaReady]);

  const handleProximity = (itemId, posX, posY) => {
    const isOverContainer = posX > 150 && posY > 200 && posY < 600;
    setActiveDropZone(prev => isOverContainer ? 'container' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverContainer = posX > 150 && posY > 200 && posY < 600;

    if (isOverContainer && itemId === 'placenta' && placentaReady) {
      setPlacentaStored(true);
      addScore(100);
      setActiveDropZone(null);
      setTimeout(() => setShowSuccess(true), 1200);
      return true;
    }
    return false;
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={14} 
        score={score}
        instruction={timer > 0 ? "DO NOT PULL CORD. Wait for natural delivery..." : "Store placenta safely in the container."} 
      />

      <View className="flex-1 items-center justify-center p-8 mb-60 relative flex-row space-x-12">
        <Animated.View className="items-center z-10 w-48 h-64 justify-center">
            <Image 
                source={require('../assets/images/mother.png')}
                style={{ width: 300, height: 300, opacity: 0.8 }}
                resizeMode="contain"
            />
            {placentaReady && !placentaStored && (
              <Animated.View entering={SlideInDown.duration(1500)} exiting={FadeOut} className="absolute bottom-[-10] z-20">
                <Image source={require('../assets/images/placenta.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </Animated.View>
            )}
            
            {!placentaReady && timer > 0 && (
                <Animated.View entering={FadeIn} className="absolute -top-20 bg-red-100 p-4 rounded-[20px] shadow-lg border-2 border-red-200">
                    <Text className="text-red-700 font-black text-center text-xs tracking-widest mb-1">WARNING</Text>
                    <Text className="text-red-600 font-bold text-center">NEVER PULL THE CORD! ❌</Text>
                    <Text className="text-red-800/60 font-black text-[30px] text-center mt-2">{timer}s</Text>
                </Animated.View>
            )}
        </Animated.View>

        {placentaReady && (
          <DropZone id="container" activeZoneId={activeDropZone} style={{ width: 160, height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <View className="items-center justify-center">
                <View className="bg-gray-200 w-32 h-40 rounded-t-xl rounded-b-[40px] border-4 border-gray-300 items-center justify-center shadow-md">
                    <View className="w-full h-8 bg-gray-400 absolute top-0 rounded-t-lg" />
                    {placentaStored && (
                        <Animated.View entering={ZoomIn} className="items-center">
                            <Image source={require('../assets/images/placenta.png')} style={{ width: 50, height: 50 }} resizeMode="contain" />
                            <Text className="text-[10px] font-black text-gray-500 mt-2">SECURED</Text>
                        </Animated.View>
                    )}
                </View>
                {!placentaStored && <Text className="mt-4 font-black text-gray-400 text-xs tracking-[2px]">PLACENTA BIN</Text>}
            </View>
          </DropZone>
        )}
      </View>

      <ItemTray 
        items={placentaReady ? TRAY_ITEMS : []} 
        usedItems={placentaStored ? ['placenta'] : []}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Placenta delivered naturally and secured for the hospital." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(14);
          }} 
        />
      )}

      <StepNavigation currentStep={14} />
    </View>
  );
}
