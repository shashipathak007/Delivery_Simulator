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
  { id: 'plastic', name: 'Plastic Sheet', icon: require('../assets/images/plastic.png'), type: 'image' },
  { id: 'sheet', name: 'Clean Sheet', icon: require('../assets/images/clean_sheet.png'), type: 'image' },
  { id: 'towel', name: 'Towel', icon: require('../assets/images/towel.png'), type: 'image' },
];

export default function Step02() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [itemsPlaced, setItemsPlaced] = useState([]);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const nextRequiredItem = 
    itemsPlaced.length === 0 ? 'plastic' :
    itemsPlaced.length === 1 ? 'sheet' :
    itemsPlaced.length === 2 ? 'towel' : null;

  const handleProximity = (itemId, posX, posY) => {
    const isOverBed = posY > 200 && posY < 600;
    setActiveDropZone(prev => isOverBed ? 'bed' : null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverBed = posY > 200 && posY < 600;

    if (isOverBed) {
      if (itemId === nextRequiredItem) {
        const newPlaced = [...itemsPlaced, itemId];
        setItemsPlaced(newPlaced);
        addScore(50);
        setActiveDropZone(null);
        
        if (newPlaced.length === 3) {
          setTimeout(() => setShowSuccess(true), 1200);
        }
        return true;
      } else {
        Alert.alert(
          '⚠️ Wrong Order!',
          'Lay the plastic sheet down first!\nIt protects the surface underneath from fluids during delivery.',
          [{ text: 'OK' }]
        );
      }
    }
    return false;
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={2} 
        score={score}
        instruction={itemsPlaced.length === 3 ? "All items placed!" : `Step ${itemsPlaced.length + 1}: Place the ${nextRequiredItem === 'plastic' ? 'Plastic Sheet' : nextRequiredItem === 'sheet' ? 'Clean Sheet' : 'Towel'} onto the bed.`} 
      />

      <View className="flex-1 items-center justify-center mb-60 relative">
        <DropZone id="bed" activeZoneId={activeDropZone} style={{ width: 350, height: 280 }}>
          <View className="items-center justify-center">
            {/* Base Bed */}
            <Image 
                source={require('../assets/images/home_bed.png')}
                style={{ width: 350, height: 250 }}
                resizeMode="contain"
            />

            {/* Layer 1: Plastic — positioned at bed surface, semi-transparent */}
            {itemsPlaced.includes('plastic') && (
              <Animated.View entering={FadeIn} style={{ position: 'absolute', top: 55, zIndex: 1 }}>
                <Image 
                    source={require('../assets/images/plastic.png')}
                    style={{ width: 280, height: 130, opacity: 0.6 }}
                    resizeMode="cover"
                />
              </Animated.View>
            )}

            {/* Layer 2: Sheet — slightly smaller, sits on top of plastic */}
            {itemsPlaced.includes('sheet') && (
              <Animated.View entering={FadeIn} style={{ position: 'absolute', top: 60, zIndex: 2 }}>
                <Image 
                    source={require('../assets/images/clean_sheet.png')}
                    style={{ width: 250, height: 120, opacity: 0.85 }}
                    resizeMode="cover"
                />
              </Animated.View>
            )}

            {/* Layer 3: Towel — smallest, center of bed */}
            {itemsPlaced.includes('towel') && (
              <Animated.View entering={FadeIn} style={{ position: 'absolute', top: 70, zIndex: 3 }}>
                <Image 
                    source={require('../assets/images/towel.png')}
                    style={{ width: 180, height: 90 }}
                    resizeMode="contain"
                />
              </Animated.View>
            )}
          </View>
        </DropZone>
        
        <View className="absolute bottom-[-20] items-center">
             <Text className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-xs">Requirement Order</Text>
             <View className="flex-row space-x-2">
                 {['Plastic', 'Sheet', 'Towel'].map((name, i) => (
                    <View key={i} className={`px-3 py-1 rounded-full ${itemsPlaced.length > i ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'} border`}>
                        <Text className={`text-[10px] ${itemsPlaced.length > i ? 'text-green-700' : 'text-gray-400'}`}>{name}</Text>
                    </View>
                 ))}
             </View>
        </View>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={itemsPlaced}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Area prepared correctly! Order followed: Plastic → Sheet → Towel." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(2);
          }} 
        />
      )}

      <StepNavigation currentStep={2} />
    </View>
  );
}
