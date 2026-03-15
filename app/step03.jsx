import React, { useState } from 'react';
import { View, Image, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'soap', name: 'Soap', icon: require('../assets/images/soap.png'), type: 'image' },
  { id: 'hands', name: 'Wash Hands', icon: require('../assets/images/wash_hands.png'), type: 'image' },
  { id: 'gloves', name: 'Wear Gloves', icon: require('../assets/images/gloves.png'), type: 'image' },
];

export default function Step03() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [soapUsed, setSoapUsed] = useState(false);
  const [washed, setWashed] = useState(false);
  const [glovesOn, setGlovesOn] = useState(false);
  const [isWashing, setIsWashing] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const washProgress = useSharedValue(0);

  const handleProximity = (itemId, posX, posY) => {
    const isOverBasin = posY > 250 && posY < 550;
    setActiveDropZone(prev => isOverBasin ? 'basin' : null);
  };

  const startWashing = () => {
    setIsWashing(true);
    washProgress.value = withTiming(1, { duration: 3000 }, () => {
      runOnJS(setWashed)(true);
      runOnJS(setIsWashing)(false);
    });
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverBasin = posY > 250 && posY < 550;

    if (isOverBasin) {
      if (itemId === 'soap' && !soapUsed) {
        setSoapUsed(true);
        addScore(50);
        setActiveDropZone(null);
        return true;
      }
      if (itemId === 'hands' && !soapUsed) {
        Alert.alert('⚠️ Soap First!', 'Add soap first! Washing without soap does not remove dangerous bacteria that can infect the mother and baby.', [{ text: 'OK' }]);
        return false;
      }
      if (itemId === 'hands' && soapUsed && !washed && !isWashing) {
        startWashing();
        setActiveDropZone(null);
        return true;
      }
      if (itemId === 'gloves' && washed && !glovesOn) {
        setGlovesOn(true);
        addScore(50);
        setActiveDropZone(null);
        setTimeout(() => setShowSuccess(true), 1200);
        return true;
      }
    }
    return false;
  };

  const washStyle = useAnimatedStyle(() => ({
    opacity: washProgress.value > 0 ? 1 : 0,
    transform: [{ scale: 1 + Math.sin(washProgress.value * 20) * 0.1 }]
  }));

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={3} 
        score={score}
        instruction={
          !soapUsed ? "Drag soap to the basin first" : 
          !washed ? (isWashing ? "Washing... Wait for clean hands" : "Now wash your hands in the soapy basin") :
          !glovesOn ? "Put on clean medical gloves" : "Hands are clean and protected!"
        } 
      />

      <View className="flex-1 items-center justify-center mb-60 relative">
        <DropZone id="basin" activeZoneId={activeDropZone} style={{ width: 300, height: 300 }}>
          <View className="items-center justify-center">
            <View className="bg-blue-100 w-64 h-64 rounded-full border-8 border-blue-200 items-center justify-center shadow-lg">
                {soapUsed && (
                    <Animated.View entering={FadeIn} className="absolute inset-4 bg-blue-50/50 rounded-full items-center justify-center border-4 border-white border-dashed">
                        <Image source={require('../assets/images/soap.png')} style={{ width: 50, height: 50 }} resizeMode="contain" />
                    </Animated.View>
                )}
                
                {isWashing && (
                    <Animated.View style={[washStyle]} className="z-10">
                        <Image source={require('../assets/images/wash_hands.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
                    </Animated.View>
                )}

                {!isWashing && washed && !glovesOn && (
                    <Animated.View entering={ZoomIn}>
                        <Image source={require('../assets/images/wash_hands.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
                    </Animated.View>
                )}

                {glovesOn && (
                     <Animated.View entering={ZoomIn} className="z-20">
                        <Image 
                            source={require('../assets/images/gloves.png')}
                            style={{ width: 150, height: 150 }}
                            resizeMode="contain"
                        />
                     </Animated.View>
                )}
            </View>
          </View>
        </DropZone>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={[soapUsed && 'soap', washed && 'hands', glovesOn && 'gloves'].filter(Boolean)}
        onDrop={handleDrop}
        onProximity={handleProximity} 
        lockedItems={!soapUsed ? ['hands', 'gloves'] : !washed ? ['gloves'] : []}
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Hands washed and gloves on! Safe to assist." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(3);
          }} 
        />
      )}

      <StepNavigation currentStep={3} />
    </View>
  );
}
