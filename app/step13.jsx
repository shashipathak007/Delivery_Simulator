import React, { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

import StepHeader from '../components/StepHeader';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';

const TRAY_ITEMS = [
  { id: 'string1', name: 'First Tie', icon: require('../assets/images/string.png'), type: 'image' },
  { id: 'string2', name: 'Second Tie', icon: require('../assets/images/string.png'), type: 'image' },
  { id: 'scissors', name: 'Scissors', icon: require('../assets/images/scissors.png'), type: 'image' },
];

export default function Step13() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [string1Pos, setString1Pos] = useState(false);
  const [string2Pos, setString2Pos] = useState(false);
  const [cutDone, setCutDone] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProximity = (itemId, posX, posY) => {
    if (itemId === 'string1' && posX < 150) setActiveDropZone('mark1');
    else if (itemId === 'string2' && posX > 250) setActiveDropZone('mark2');
    else if (itemId === 'scissors' && posX > 150 && posX < 250) setActiveDropZone('cut');
    else setActiveDropZone(null);
  };

  const handleDrop = (itemId, posX, posY) => {
    const isLeft = posX < 150;
    const isRight = posX > 250;
    const isCenter = posX >= 150 && posX <= 250;

    if (itemId === 'scissors' && isCenter && (!string1Pos || !string2Pos)) {
      Alert.alert('⚠️ Tie First!', 'Tie TWICE before cutting!\nAn untied cord bleeds heavily and causes dangerous blood loss in baby.', [{ text: 'OK' }]);
      return false;
    }

    if (itemId === 'string1' && isLeft && !string1Pos) {
      setString1Pos(true);
      addScore(50);
      setActiveDropZone(null);
      return true;
    }
    if (itemId === 'string2' && isRight && !string2Pos) {
      setString2Pos(true);
      addScore(50);
      setActiveDropZone(null);
      return true;
    }
    if (itemId === 'scissors' && isCenter && string1Pos && string2Pos && !cutDone) {
      setCutDone(true);
      addScore(100);
      setActiveDropZone(null);
      setTimeout(() => setShowSuccess(true), 1200);
      return true;
    }
    return false;
  };

  const usedItems = [string1Pos && 'string1', string2Pos && 'string2', cutDone && 'scissors'].filter(Boolean);
  const lockedItems = [];
  if (!string1Pos || !string2Pos) lockedItems.push('scissors');

  return (
    <View className="flex-1 bg-blue-50">
      <StepHeader 
        step={13} 
        score={score}
        instruction={cutDone ? "Cord cut successfully!" : (!string1Pos || !string2Pos) ? "Tie both strings around the umbilical cord" : "Now cut between the strings!"} 
      />

      <View className="flex-1 items-center justify-center mb-60 relative flex-row">
        <DropZone id="mark1" activeZoneId={activeDropZone} style={{ width: 100, height: 180 }} />
        <DropZone id="cut" activeZoneId={activeDropZone} style={{ width: 100, height: 180 }} />
        <DropZone id="mark2" activeZoneId={activeDropZone} style={{ width: 100, height: 180 }} />

        <View className="absolute z-10 w-[340px] h-[120px] justify-center items-center">
          <Svg height="100" width="340" viewBox="0 0 340 100">
            <Defs>
                <LinearGradient id="cordGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#F43F5E" />
                    <Stop offset="100%" stopColor="#BE123C" />
                </LinearGradient>
            </Defs>

            {!cutDone ? (
                <G>
                    <Path d="M20 50 Q170 30 320 50" stroke="url(#cordGrad)" strokeWidth="24" fill="none" strokeLinecap="round"/>
                    <Path d="M30 50 Q170 35 310 50" stroke="#E11D48" strokeWidth="4" fill="none" opacity="0.3" strokeDasharray="5 5" />
                </G>
            ) : (
              <G>
                <Path d="M20 50 Q85 35 150 50" stroke="url(#cordGrad)" strokeWidth="24" fill="none" strokeLinecap="round"/>
                <Path d="M190 50 Q255 35 320 50" stroke="url(#cordGrad)" strokeWidth="24" fill="none" strokeLinecap="round"/>
              </G>
            )}

            {string1Pos && (
               <G transform="translate(80, 25)">
                   <Rect x="0" y="0" width="15" height="50" fill="#FFFFFF" rx="5" stroke="#94A3B8" strokeWidth="2" />
               </G>
            )}
            {string2Pos && (
              <G transform="translate(245, 25)">
                 <Rect x="0" y="0" width="15" height="50" fill="#FFFFFF" rx="5" stroke="#94A3B8" strokeWidth="2" />
              </G>
            )}
          </Svg>
          
          {cutDone && (
              <Animated.View entering={ZoomIn} className="absolute z-30">
                  <Image source={require('../assets/images/scissors.png')} style={{ width: 60, height: 60, transform: [{ rotate: '45deg' }] }} />
              </Animated.View>
          )}
        </View>

        <View className="absolute bottom-[-20] flex-row space-x-2">
             <View className={`px-4 py-1 rounded-full ${string1Pos ? 'bg-green-100' : 'bg-gray-100'}`}><Text className="text-[10px] font-bold">TIE 1</Text></View>
             <View className={`px-4 py-1 rounded-full ${string2Pos ? 'bg-green-100' : 'bg-gray-100'}`}><Text className="text-[10px] font-bold">TIE 2</Text></View>
             <View className={`px-4 py-1 rounded-full ${cutDone ? 'bg-green-100' : 'bg-gray-100'}`}><Text className="text-[10px] font-bold">CUT</Text></View>
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
          message="Cord clamped and cut correctly! Placenta delivery is next." 
          onComplete={() => {
            setShowSuccess(false);
            markStepComplete(13);
          }} 
        />
      )}

      <StepNavigation currentStep={13} />
    </View>
  );
}
