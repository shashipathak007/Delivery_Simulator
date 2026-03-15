import React, { useState } from 'react';
import { View, Image, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'mother', name: 'Mother', icon: require('../assets/images/mother.png'), type: 'image' },
  { id: 'pillow', name: 'Pillow', icon: require('../assets/images/pillow.png'), type: 'image' },
  { id: 'towel', name: 'Towel', icon: require('../assets/images/towel.png'), type: 'image' },
];

export default function Step06() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [motherPos, setMotherPos] = useState(false);
  const [pillowPos, setPillowPos] = useState(false);
  const [towelPos, setTowelPos] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProximity = (itemId, posX, posY) => {
    const isOverBed = posY > 200 && posY < 600;
    setActiveDropZone(prev => isOverBed ? 'bed' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverBed = posY > 200 && posY < 650;

    if (isOverBed) {
      if (itemId === 'mother' && !motherPos) {
        setMotherPos(true);
        addScore(50);
        checkDone(true, pillowPos, towelPos);
        setActiveDropZone(null);
        return true;
      }
      if (itemId === 'pillow' && !motherPos) {
        Alert.alert('⚠️ Mother First!', 'Place the mother on the bed first before adding support.', [{ text: 'OK' }]);
        return false;
      }
      if (itemId === 'pillow' && motherPos && !pillowPos) {
        setPillowPos(true);
        addScore(50);
        checkDone(motherPos, true, towelPos);
        setActiveDropZone(null);
        return true;
      }
      if (itemId === 'towel' && motherPos && !towelPos) {
        setTowelPos(true);
        addScore(50);
        checkDone(motherPos, pillowPos, true);
        setActiveDropZone(null);
        return true;
      }
    }
    return false;
  };

  const checkDone = (m, p, t) => {
    if (m && p && t) {
      setTimeout(() => setShowSuccess(true), 1200);
    }
  };

  const usedItems = [
    motherPos && 'mother', 
    pillowPos && 'pillow', 
    towelPos && 'towel'
  ].filter(Boolean);

  const lockedItems = [];
  if (!motherPos) {
    lockedItems.push('pillow', 'towel');
  }

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={6} 
        score={score}
        instruction={!motherPos ? "Drag mother onto the bed gently" : !pillowPos ? "Place pillow behind her back for support" : !towelPos ? "Place towel under her lower area" : "Perfect positioning!"} 
      />

      <View className="flex-1 items-center justify-center mb-60 relative">
        <DropZone id="bed" activeZoneId={activeDropZone} style={{ width: 350, height: 350 }}>
          <View className="items-center justify-center">
            {/* Home Bed — base layer */}
            <Image 
                source={require('../assets/images/home_bed.png')}
                style={{ width: 340, height: 340 }}
                resizeMode="contain"
            />

            {/* Towel — on the bed surface, beneath mother */}
            {towelPos && (
                <Animated.View entering={FadeIn} style={{ position: 'absolute', bottom: 50, zIndex: 1 }}>
                    <Image 
                       source={require('../assets/images/towel.png')}
                       style={{ width: 130, height: 70 }}
                       resizeMode="contain"
                    />
                </Animated.View>
            )}

            {/* Pillow — behind mother at headboard area */}
            {pillowPos && (
                <Animated.View entering={ZoomIn} style={{ position: 'absolute', top: 75, left: 55, zIndex: 2 }}>
                    <Image 
                        source={require('../assets/images/pillow.png')}
                        style={{ width: 100, height: 80 }}
                        resizeMode="contain"
                    />
                </Animated.View>
            )}

            {/* Mother — main layer on top */}
            {motherPos && (
              <Animated.View entering={FadeIn} style={{ position: 'absolute', top: 55, zIndex: 3 }}>
                <Image 
                   source={require('../assets/images/mother.png')}
                   style={{ width: 240, height: 240 }}
                   resizeMode="contain"
                />
              </Animated.View>
            )}
          </View>
        </DropZone>
        
        <View className="absolute bottom-[-30] bg-white/60 px-6 py-2 rounded-full border border-blue-100">
             <Text className="text-blue-800 font-bold text-xs">GOAL: RECLINED POSITION WITH SUPPORT</Text>
        </View>
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
          message="Mother is positioned correctly! Support provided." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(6);
          }} 
        />
      )}

      <StepNavigation currentStep={6} />
    </View>
  );
}
