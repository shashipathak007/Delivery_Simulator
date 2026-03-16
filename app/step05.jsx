import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Animated, { FadeInUp, ZoomIn, BounceIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'scissors', name: 'Scissors', type: 'image', icon: require('../assets/images/scissors.png') },
  { id: 'string', name: 'String', type: 'image', icon: require('../assets/images/string.jpg') }
];

const SCENE_PROGRESSION = [
  { id: 'boiling', image: require('../assets/images/Clean_Bed.jpg') },
];

export default function Step05() {
  const { addScore, score, markStepComplete } = useGame();
  const [scissorsInPot, setScissorsInPot] = useState(false);
  const [stringInPot, setStringInPot] = useState(false);
  const [boiling, setBoiling] = useState(false);
  const [boilProgress, setBoilProgress] = useState(0);
  const [sterilized, setSterilized] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const steamScale = useSharedValue(1);
  useEffect(() => {
    steamScale.value = withRepeat(withSequence(withTiming(1.2, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
  }, []);
  const steamStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: steamScale.value }], 
    opacity: boiling ? 0.9 : 0.3 
  }));

  const handleStartBoiling = () => {
    if (scissorsInPot && stringInPot && !boiling) {
      setBoiling(true);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setBoilProgress(count * 5);
        if (count >= 20) { 
          clearInterval(interval); 
          setSterilized(true); 
          addScore(100); 
          setTimeout(() => markStepComplete(5), 1800); 
        }
      }, 300);
    }
  };

  const handleProximity = (itemId, x, y) => {
    if (boiling || sterilized) { setActiveDropZone(null); return; }
    const isLeft = x < width / 2;
    // Pot drop zones are in the middle of the screen
    if (y > height * 0.3 && y < height * 0.7) {
      if (itemId === 'scissors' && isLeft && !scissorsInPot) { setActiveDropZone('pot1'); return; }
      if (itemId === 'string' && !isLeft && !stringInPot) { setActiveDropZone('pot2'); return; }
    }
    setActiveDropZone(null);
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);
    if (boiling || sterilized) return false;
    const isLeft = x < width / 2;
    if (y > height * 0.3 && y < height * 0.7) {
      if (itemId === 'scissors' && isLeft && !scissorsInPot) { 
        setScissorsInPot(true); 
        addScore(25); 
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
        return true; 
      }
      if (itemId === 'string' && !isLeft && !stringInPot) { 
        setStringInPot(true); 
        addScore(25); 
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
        return true; 
      }
    }
    return false;
  };

  const usedItems = []; 
  if (scissorsInPot) usedItems.push('scissors'); 
  if (stringInPot) usedItems.push('string');
  const isDone = sterilized;

  return (
    <GameStep
      step={5}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={0}
      isDone={isDone}
      showConfetti={isDone}
      statusTitle="TOOLS STERILE"
      statusDetail="SAFE TO PROCEED"
      topContent={!boiling && !sterilized && (
        <ItemTray items={TRAY_ITEMS} usedItems={usedItems} lockedItems={[]} onDrop={handleDrop} onProximity={handleProximity} position="top" />
      )}
    >
      {/* Pots UI */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 5 }} pointerEvents="none">
        <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
          {/* Pot 1 */}
          <View style={{ alignItems: 'center' }}>
            {!scissorsInPot && (
              <View style={{ position: 'absolute', top: -40, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
                <DropZone id="pot1" activeZoneId={activeDropZone} style={{ flex: 1 }} />
              </View>
            )}
            <Animated.View style={[steamStyle, { marginBottom: -5 }]}>
               <Text style={{ fontSize: 40 }}>♨️</Text>
            </Animated.View>
            <View style={{ 
              width: 130, height: 110, backgroundColor: '#78716C', 
              borderRadius: 15, borderWidth: 4, 
              borderColor: activeDropZone === 'pot1' ? '#4ADE80' : boiling ? '#F59E0B' : '#57534E',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10
            }}>
               {scissorsInPot ? (
                 <Animated.View entering={ZoomIn}>
                   <Image source={require('../assets/images/scissors.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
                 </Animated.View>
               ) : (
                 <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900' }}>POT 1</Text>
               )}
               <View style={{ position: 'absolute', bottom: 5, width: '90%', height: 40, backgroundColor: boiling ? 'rgba(245,158,11,0.2)' : 'rgba(96,165,250,0.2)', borderRadius: 10 }} />
            </View>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12, marginTop: 8 }}>SCISSORS</Text>
          </View>

          {/* Pot 2 */}
          <View style={{ alignItems: 'center' }}>
            {!stringInPot && (
              <View style={{ position: 'absolute', top: -40, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
                <DropZone id="pot2" activeZoneId={activeDropZone} style={{ flex: 1 }} />
              </View>
            )}
            <Animated.View style={[steamStyle, { marginBottom: -5 }]}>
               <Text style={{ fontSize: 40 }}>♨️</Text>
            </Animated.View>
            <View style={{ 
              width: 130, height: 110, backgroundColor: '#78716C', 
              borderRadius: 15, borderWidth: 4, 
              borderColor: activeDropZone === 'pot2' ? '#4ADE80' : boiling ? '#F59E0B' : '#57534E',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10
            }}>
               {stringInPot ? (
                 <Animated.View entering={ZoomIn}>
                   <Image source={require('../assets/images/string.jpg')} style={{ width: 60, height: 60 }} resizeMode="contain" />
                 </Animated.View>
               ) : (
                 <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900' }}>POT 2</Text>
               )}
               <View style={{ position: 'absolute', bottom: 5, width: '90%', height: 40, backgroundColor: boiling ? 'rgba(245,158,11,0.2)' : 'rgba(96,165,250,0.2)', borderRadius: 10 }} />
            </View>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12, marginTop: 8 }}>STRING</Text>
          </View>
        </View>

        {boiling && !sterilized && (
          <Animated.View entering={FadeInUp} style={{ marginTop: 30, width: '80%' }}>
             <Text style={{ color: '#F59E0B', fontWeight: '900', textAlign: 'center', marginBottom: 10, letterSpacing: 2 }}>BOILING... {boilProgress}%</Text>
             <View style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ width: `${boilProgress}%`, height: '100%', backgroundColor: '#F59E0B' }} />
             </View>
          </Animated.View>
        )}
      </View>

      {/* Instruction Panel */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }} pointerEvents="box-none">
        <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' }}>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>
            {sterilized ? 'Tools are sterile and safe! Click NEXT to proceed.' : boiling ? 'Waiting for 20 minutes... This kills all harmful bacteria.' : (!scissorsInPot || !stringInPot) ? 'Drag scissors and string into the pots of clean water.' : 'Both items ready! Tap the button below to start boiling.'}
          </Text>
        </View>

        {scissorsInPot && stringInPot && !boiling && !sterilized && (
          <TouchableOpacity 
            onPress={handleStartBoiling}
            activeOpacity={0.8}
            style={{ 
              backgroundColor: '#F59E0B', borderRadius: 20, paddingVertical: 18, 
              alignItems: 'center', marginTop: 15, shadowColor: '#F59E0B', 
              shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>START BOILING</Text>
          </TouchableOpacity>
        )}
      </View>
    </GameStep>
  );
}
