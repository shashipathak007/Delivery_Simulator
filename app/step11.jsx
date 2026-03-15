import React, { useState } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'baby', name: 'Baby', icon: require('../assets/images/baby.png'), type: 'image' },
  { id: 'towel', name: 'Towel', icon: require('../assets/images/towel.png'), type: 'image' },
];

export default function Step11() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [babyPos, setBabyPos] = useState(false);
  const [towelPos, setTowelPos] = useState(false);
  const [isDrying, setIsDrying] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const dryProgress = useSharedValue(0);

  const handleProximity = (itemId, posX, posY) => {
    const isOverChest = posY > 150 && posY < 550;
    setActiveDropZone(prev => isOverChest ? 'chest' : null);
  };

  const startDrying = () => {
    setIsDrying(true);
    dryProgress.value = withTiming(1, { duration: 2500 }, () => {
      runOnJS(setTowelPos)(true);
      runOnJS(setIsDrying)(false);
    });
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverChest = posY > 150 && posY < 550;

    if (isOverChest) {
      if (itemId === 'baby' && !babyPos) {
        setBabyPos(true);
        addScore(50);
        setActiveDropZone(null);
        return true;
      }
      if (itemId === 'towel' && babyPos && !towelPos && !isDrying) {
        startDrying();
        setActiveDropZone(null);
        return true;
      }
    }
    return false;
  };

  React.useEffect(() => {
    if (towelPos && babyPos) {
       setTimeout(() => setShowSuccess(true), 1200);
    }
  }, [towelPos]);

  const towelStyle = useAnimatedStyle(() => ({
    opacity: dryProgress.value > 0 ? 0.8 : 0,
    transform: [
        { translateX: Math.sin(dryProgress.value * 30) * 10 },
        { scale: 1 }
    ]
  }));

  const usedItems = [babyPos && 'baby', (towelPos || isDrying) && 'towel'].filter(Boolean);
  const lockedItems = !babyPos ? ['towel'] : [];

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={11} 
        score={score}
        instruction={!babyPos ? "Immediately place baby on mother's chest" : !towelPos ? (isDrying ? "Drying baby carefully..." : "Now dry the baby with a clean towel") : "Baby is warm and dry!"} 
      />

      <View className="flex-1 items-center justify-center mb-60 relative">
        <DropZone id="chest" activeZoneId={activeDropZone} style={{ width: 350, height: 450 }}>
          <View className="items-center justify-center">
            {/* Mother Background — base layer */}
            <Image 
                source={require('../assets/images/mother.png')}
                style={{ width: 320, height: 320 }}
                resizeMode="contain"
            />

            {/* Baby Layer — on top of mother */}
            {babyPos && (
              <Animated.View entering={ZoomIn} style={{ position: 'absolute', top: 80, zIndex: 2 }}>
                <View className={`w-32 h-44 rounded-full items-center justify-center ${towelPos ? 'bg-pink-100' : 'bg-[#D1E9FF]'} border-4 border-white/60 shadow-xl shadow-pink-200`}>
                   <View className="p-4 items-center">
                      <Image source={require('../assets/images/baby.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
                      <View className="mt-2 px-3 py-1 bg-white/40 rounded-full">
                         <Text className="text-[10px] font-black tracking-widest text-[#5DA9E9]">{towelPos ? 'DRY' : 'WET'}</Text>
                      </View>
                   </View>
                </View>
              </Animated.View>
            )}

            {/* Towel Drying Animation — over baby, semi-transparent */}
            {isDrying && (
              <Animated.View style={[towelStyle, { position: 'absolute', top: 80, zIndex: 3 }]}>
                    <Image 
                        source={require('../assets/images/towel.png')}
                        style={{ width: 140, height: 160, opacity: 0.7 }}
                        resizeMode="contain"
                    />
              </Animated.View>
            )}
          </View>
        </DropZone>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={usedItems}
        lockedItems={lockedItems}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Skin-to-skin contact established! Baby is dry and warm." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(11);
          }} 
        />
      )}

      <StepNavigation currentStep={11} />
    </View>
  );
}
