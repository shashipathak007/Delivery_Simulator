import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'babyblanket', name: 'Baby Blanket', icon: require('../assets/images/blanket.png'), type: 'image' },
  { id: 'momcover', name: 'Mother Cover', icon: require('../assets/images/clean_sheet.png'), type: 'image' },
];

export default function Step16() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [babyCovered, setBabyCovered] = useState(false);
  const [momCovered, setMomCovered] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProximity = (itemId, posX, posY) => {
    if (itemId === 'babyblanket' && posX < 180 && posY > 200 && posY < 600) {
      setActiveDropZone('baby');
    } else if (itemId === 'momcover' && posX > 200 && posY > 200 && posY < 600) {
      setActiveDropZone('mom');
    } else {
      setActiveDropZone(null);
    }
  };

  const handleDrop = (itemId, posX, posY) => {
    const isLeft = posX < 180 && posY > 200 && posY < 600;
    const isRight = posX > 200 && posY > 200 && posY < 600;

    // Enforce Baby First
    if (isLeft && itemId === 'babyblanket' && !babyCovered) {
      setBabyCovered(true);
      addScore(50);
      setActiveDropZone(null);
      return true;
    }
    if (isRight && itemId === 'momcover' && !momCovered) {
      if (!babyCovered) {
          Alert.alert('⚠️ Baby First!', 'Cover the baby immediately!\nNewborns lose body heat very fast and hypothermia can be fatal within minutes.', [{ text: 'OK' }]);
          return false;
      }
      setMomCovered(true);
      addScore(50);
      setActiveDropZone(null);
      setTimeout(() => setShowSuccess(true), 1200);
      return true;
    }
    return false;
  };

  const usedItems = [babyCovered && 'babyblanket', momCovered && 'momcover'].filter(Boolean);
  const lockedItems = !babyCovered ? ['momcover'] : [];

  return (
    <View className={`flex-1 ${babyCovered && momCovered ? 'bg-orange-50' : 'bg-blue-50'}`}>
      <StepHeader 
        step={16} 
        score={score}
        instruction={!babyCovered ? "Step 1: Cover the baby first for warmth" : !momCovered ? "Step 2: Now cover the mother" : "Both are cozy and safe!"} 
      />

      <View className="flex-1 items-center justify-center mb-60 flex-row relative px-4">
        
        {/* Baby Coverage Target */}
        <DropZone id="baby" activeZoneId={activeDropZone} style={{ width: 140, height: 260 }}>
           <View className="items-center justify-center">
              <Image source={require('../assets/images/baby.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
              {babyCovered && (
                <Animated.View entering={ZoomIn} style={{ position: 'absolute', bottom: -10, zIndex: 2 }}>
                    <Image 
                        source={require('../assets/images/blanket.png')}
                        style={{ width: 120, height: 100, opacity: 0.9 }}
                        resizeMode="contain"
                    />
                </Animated.View>
              )}
           </View>
        </DropZone>

        {/* Mother Coverage Target */}
        <DropZone id="mom" activeZoneId={activeDropZone} style={{ width: 220, height: 320 }}>
            <View className="items-center justify-center">
               <Image 
                   source={require('../assets/images/mother.png')}
                   style={{ width: 220, height: 220, opacity: 0.8 }}
                   resizeMode="contain"
               />
               {momCovered && (
                <Animated.View entering={ZoomIn} style={{ position: 'absolute', bottom: 0, zIndex: 2 }}>
                    <Image 
                        source={require('../assets/images/clean_sheet.png')}
                        style={{ width: 200, height: 180, opacity: 0.85 }}
                        resizeMode="contain"
                    />
                </Animated.View>
               )}
            </View>
        </DropZone>

        {babyCovered && momCovered && (
            <Animated.View entering={FadeIn.duration(1500)} className="absolute inset-0 z-0 bg-yellow-400 opacity-10 pointer-events-none" />
        )}
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
          message="Warmth maintained! Crucial for recovery." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(16);
          }} 
        />
      )}

      <StepNavigation currentStep={16} />
    </View>
  );
}
