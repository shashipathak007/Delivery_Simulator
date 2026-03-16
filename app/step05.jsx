import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeInUp, SlideInRight, ZoomIn, FadeInDown,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'scissors', name: 'Scissors', type: 'image', icon: require('../assets/images/scissors.png') },
  { id: 'string', name: 'String', type: 'image', icon: require('../assets/images/string.png') }
];

export default function Step05() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [scissorsInPot, setScissorsInPot] = useState(false);
  const [stringInPot, setStringInPot] = useState(false);
  const [boiling, setBoiling] = useState(false);
  const [boilProgress, setBoilProgress] = useState(0);
  const [sterilized, setSterilized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [activeDropZone, setActiveDropZone] = useState(null);

  const steamScale = useSharedValue(1);

  React.useEffect(() => {
    steamScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ), -1, true
    );
  }, []);

  const steamStyle = useAnimatedStyle(() => ({
    transform: [{ scale: steamScale.value }],
    opacity: boiling ? 0.8 : 0.3,
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
          setTimeout(() => {
            markStepComplete(5);
          }, 1500);
        }
      }, 300);
    }
  };

  const handleProximity = (itemId, x, y) => {
    if (boiling || sterilized) { setActiveDropZone(null); return; }

    const centerY = height / 2;
    const isLeft = x < width / 2;
    
    // Pot 1 is roughly on the left side, Pot 2 is on the right side
    if (y > height * 0.3 && y < height * 0.7) {
      if (itemId === 'scissors' && isLeft && !scissorsInPot) {
        setActiveDropZone('pot1');
        return;
      }
      if (itemId === 'string' && !isLeft && !stringInPot) {
        setActiveDropZone('pot2');
        return;
      }
    }
    setActiveDropZone(null);
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);
    if (boiling || sterilized) return false;

    const centerY = height / 2;
    const isLeft = x < width / 2;

    if (y > height * 0.3 && y < height * 0.7) {
      if (itemId === 'scissors' && isLeft && !scissorsInPot) {
        setScissorsInPot(true);
        addScore(25);
        return true;
      }
      if (itemId === 'string' && !isLeft && !stringInPot) {
        setStringInPot(true);
        addScore(25);
        return true;
      }
    }
    return false;
  };

  const usedItems = [];
  if (scissorsInPot) usedItems.push('scissors');
  if (stringInPot) usedItems.push('string');

  const lockedItems = [];

  const isDone = sterilized;

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1207' }}>
      <StatusBar barStyle="light-content" />

      {/* Top Inventory Tray */}
      {!boiling && !sterilized && (
        <ItemTray 
          items={TRAY_ITEMS}
          usedItems={usedItems}
          lockedItems={lockedItems}
          onDrop={handleDrop}
          onProximity={handleProximity}
          position="top"
        />
      )}

      {/* Warm gradient background */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#1C1917' }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '40%', backgroundColor: '#292524' }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: '#1C1917' }} />
        </View>
      </View>

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }} pointerEvents="box-none">
        
        {/* Header pushed down slightly if tray is active */}
        <View pointerEvents="none" style={{ marginTop: (!boiling && !sterilized) ? 110 : 0 }}>
          <StepHeader step={5} score={score} instruction="" />
        </View>

        {/* CENTER - Two Pots */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }} pointerEvents="none">
          
          <View style={{ flexDirection: 'row', gap: 30, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
            
            {/* Pot 1 - Scissors */}
            <View style={{ alignItems: 'center', width: 140 }}>
              {/* Invisible Drop Zone overlay for Pot 1 */}
              {!scissorsInPot && (
                <View style={{ position: 'absolute', top: -20, left: -10, right: -10, bottom: 0, zIndex: 2 }}>
                  <DropZone id="pot1" activeZoneId={activeDropZone} style={{ flex: 1 }} />
                </View>
              )}

              {(scissorsInPot || boiling) && (
                <Animated.View style={[steamStyle, { marginBottom: -10 }]}>
                  <Text style={{ fontSize: 30, opacity: boiling ? 1 : 0.4 }}>
                    {boiling ? '♨️' : ''}
                  </Text>
                </Animated.View>
              )}
              
              <View style={{
                width: 140, height: 120, backgroundColor: '#78716C', borderRadius: 12,
                borderTopLeftRadius: 4, borderTopRightRadius: 4,
                borderWidth: 4, borderColor: boiling ? '#F59E0B' : (activeDropZone === 'pot1' ? '#4ADE80' : '#57534E'),
                alignItems: 'center', justifyContent: 'center',
                shadowColor: boiling ? '#F59E0B' : '#000',
                shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12,
                overflow: 'hidden',
              }}>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', backgroundColor: boiling ? 'rgba(234,179,8,0.3)' : 'rgba(147,197,253,0.3)', borderRadius: 8 }} />
                <View style={{ position: 'absolute', left: -16, top: 10, width: 16, height: 8, backgroundColor: '#57534E', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }} />
                <View style={{ position: 'absolute', right: -16, top: 10, width: 16, height: 8, backgroundColor: '#57534E', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />

                {scissorsInPot ? (
                  <Animated.View entering={ZoomIn}>
                    <Image source={require('../assets/images/scissors.png')} style={{ width: 70, height: 70 }} resizeMode="contain" />
                  </Animated.View>
                ) : (
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 2 }}>EMPTY</Text>
                )}
              </View>

              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12, marginTop: 10, letterSpacing: 1 }}>POT 1 — SCISSORS</Text>
              
              {sterilized && (
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 6 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 10, letterSpacing: 1 }}>STERILE</Text>
                </View>
              )}
            </View>

            {/* Pot 2 - String */}
            <View style={{ alignItems: 'center', width: 140 }}>
              {!stringInPot && (
                <View style={{ position: 'absolute', top: -20, left: -10, right: -10, bottom: 0, zIndex: 2 }}>
                  <DropZone id="pot2" activeZoneId={activeDropZone} style={{ flex: 1 }} />
                </View>
              )}

              {(stringInPot || boiling) && (
                <Animated.View style={[steamStyle, { marginBottom: -10 }]}>
                  <Text style={{ fontSize: 30, opacity: boiling ? 1 : 0.4 }}>
                    {boiling ? '♨️' : ''}
                  </Text>
                </Animated.View>
              )}
              
              <View style={{
                width: 140, height: 120, backgroundColor: '#78716C', borderRadius: 12,
                borderTopLeftRadius: 4, borderTopRightRadius: 4,
                borderWidth: 4, borderColor: boiling ? '#F59E0B' : (activeDropZone === 'pot2' ? '#4ADE80' : '#57534E'),
                alignItems: 'center', justifyContent: 'center',
                shadowColor: boiling ? '#F59E0B' : '#000',
                shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12,
                overflow: 'hidden',
              }}>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', backgroundColor: boiling ? 'rgba(234,179,8,0.3)' : 'rgba(147,197,253,0.3)', borderRadius: 8 }} />
                <View style={{ position: 'absolute', left: -16, top: 10, width: 16, height: 8, backgroundColor: '#57534E', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }} />
                <View style={{ position: 'absolute', right: -16, top: 10, width: 16, height: 8, backgroundColor: '#57534E', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />

                {stringInPot ? (
                  <Animated.View entering={ZoomIn}>
                    <Image source={require('../assets/images/string.png')} style={{ width: 70, height: 70 }} resizeMode="contain" />
                  </Animated.View>
                ) : (
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 2 }}>EMPTY</Text>
                )}
              </View>

              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12, marginTop: 10, letterSpacing: 1 }}>POT 2 — STRING</Text>
              
              {sterilized && (
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 6 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 10, letterSpacing: 1 }}>STERILE</Text>
                </View>
              )}
            </View>
          </View>

          {/* Boiling progress */}
          {boiling && !sterilized && (
            <Animated.View entering={FadeIn} style={{ marginTop: 30, alignItems: 'center', width: '100%' }}>
              <Text style={{ color: '#F59E0B', fontWeight: '900', fontSize: 14, letterSpacing: 2, marginBottom: 10 }}>
                BOILING... {boilProgress}%
              </Text>
              <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, width: '80%' }}>
                <View style={{ height: 8, backgroundColor: '#F59E0B', borderRadius: 4, width: `${boilProgress}%` }} />
              </View>
            </Animated.View>
          )}
        </View>

        {/* BOTTOM */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }} pointerEvents="box-none">
          <Animated.View 
            entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}
            pointerEvents="none"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 22 }}>
              {sterilized 
                ? 'Tools are sterilized and safe. Boiling water kills bacteria.'
                : boiling 
                  ? 'Boiling for 20 minutes kills all bacteria. Wait...'
                  : (!scissorsInPot || !stringInPot) 
                    ? 'Drag scissors to the left pot, and string to the right pot.'
                    : 'Both tools are in pots. Start boiling to sterilize!'
              }
            </Text>
          </Animated.View>
          
          {scissorsInPot && stringInPot && !boiling && !sterilized && (
            <Animated.View entering={FadeInUp.delay(200)}>
              <TouchableOpacity onPress={handleStartBoiling} activeOpacity={0.85}
                style={{ backgroundColor: '#F59E0B', borderRadius: 18, paddingVertical: 18, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#D97706',
                  shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>START BOILING</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={5} />
      </SafeAreaView>

      {/* No success popups */}
    </View>
  );
}
