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
  { id: 'antiseptic', name: 'Antiseptic', icon: require('../assets/images/antiseptic.png'), type: 'image' },
  { id: 'scissors', name: 'Scissors', icon: require('../assets/images/scissors.png'), type: 'image' },
  { id: 'string', name: 'String', icon: require('../assets/images/string.png'), type: 'image' },
];

export default function Step05() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [scissorsClean, setScissorsClean] = useState(false);
  const [stringClean, setStringClean] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProximity = (itemId, posX, posY) => {
    if (itemId === 'antiseptic') {
        if (posY > 200 && posY < 600) setActiveDropZone('tools');
    } else {
        setActiveDropZone(null);
    }
  };

  const handleDrop = (itemId, posX, posY) => {
    const isOverTools = posY > 200 && posY < 600;

    if (itemId === 'antiseptic' && isOverTools) {
      if (!scissorsClean) {
        setScissorsClean(true);
        addScore(50);
        return false; 
      } else if (!stringClean) {
        setStringClean(true);
        addScore(50);
        setTimeout(() => setShowSuccess(true), 1200);
        return false;
      }
    }
    return false;
  };

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={5} 
        score={score}
        instruction={!scissorsClean ? "Apply antiseptic to the scissors first" : !stringClean ? "Now apply antiseptic to the strings" : "All tools are sterile!"} 
      />

      <View className="flex-1 items-center justify-center mb-60 relative">
        <DropZone id="tools" activeZoneId={activeDropZone} style={{ width: 340, height: 320 }}>
          <View className="items-center justify-center flex-row space-x-12 p-8 bg-white/60 rounded-[40px] border-4 border-dashed border-blue-200 shadow-sm">
            <View className="items-center">
                <Image 
                    source={require('../assets/images/scissors.png')}
                    style={{ width: 100, height: 100, opacity: scissorsClean ? 1 : 0.3 }}
                    resizeMode="contain"
                />
                {scissorsClean && <Animated.View entering={ZoomIn} className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 items-center justify-center"><Text className="text-white text-[10px] font-bold">✓</Text></Animated.View>}
                <Text className="mt-4 text-blue-900 font-black text-[10px] tracking-widest uppercase">Scissors</Text>
            </View>

            <View className="items-center">
                <Image 
                    source={require('../assets/images/string.png')}
                    style={{ width: 80, height: 80, opacity: stringClean ? 1 : 0.3 }}
                    resizeMode="contain"
                />
                {stringClean && <Animated.View entering={ZoomIn} className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 items-center justify-center"><Text className="text-white text-[10px] font-bold">✓</Text></Animated.View>}
                <Text className="mt-4 text-blue-900 font-black text-[10px] tracking-widest uppercase">Strings</Text>
            </View>
          </View>
          
          {activeDropZone === 'tools' && (
              <Animated.View entering={FadeIn} className="absolute -top-12 self-center bg-blue-600 px-6 py-2 rounded-full shadow-lg">
                  <Text className="text-white font-black text-xs tracking-widest">DRIP ANTISEPTIC</Text>
              </Animated.View>
          )}
        </DropZone>
      </View>

      <ItemTray 
        items={TRAY_ITEMS} 
        usedItems={[]}
        onDrop={handleDrop}
        onProximity={handleProximity} 
      />

      {showSuccess && (
        <SuccessOverlay 
          message="Critical tools sterilized! Ready to assist the mother." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(5);
          }} 
        />
      )}

      <StepNavigation currentStep={5} />
    </View>
  );
}
