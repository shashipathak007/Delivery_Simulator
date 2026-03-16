import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, SlideInRight, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'blanket', name: 'Blanket', type: 'image', icon: require('../assets/images/blanket.png') },
  { id: 'sheet', name: 'Clean Sheet', type: 'image', icon: require('../assets/images/clean_sheet.png') }
];

const SCENE_PROGRESSION = [
  {
    id: 'exposed',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Both are exposed to the cold air. Drag BLANKET to baby.',
    requiredItem: 'blanket',
    actionLabel: null,
  },
  {
    id: 'baby_covered',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Baby is warm. Now drag SHEET to the mother.',
    requiredItem: 'sheet',
    actionLabel: null,
  },
  {
    id: 'all_covered',
    image: require('../assets/images/PutOnMothersChest.png'),
    instruction: 'Both are warm, safe, and resting together.',
    requiredItem: null,
    actionLabel: null,
  },
];

export default function Step16() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  const [usedItems, setUsedItems] = useState([]);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  // Handle Drag & Drop
  const handleProximity = (itemId, x, y) => {
    if (transitioning || isDone) return;
    
    // Evaluate proximity based on current required item
    // Baby is roughly bottom right of center
    const isBabyZone = sceneIndex === 0 && x > width / 2 && y > height / 2;
    // Mother is generally the rest of the chest area
    const isMotherZone = sceneIndex === 1 && y > height / 3 && y < height * 0.8 && x < width / 2;

    if (itemId === 'blanket' && isBabyZone) {
      setActiveDropZone('baby');
    } else if (itemId === 'sheet' && isMotherZone) {
      setActiveDropZone('mother');
    } else {
      setActiveDropZone(null);
    }
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);
    if (transitioning || isDone) return false;

    const isBabyZone = sceneIndex === 0 && x > width / 2 && y > height / 2;
    const isMotherZone = sceneIndex === 1 && y > height / 3 && y < height * 0.8 && x < width / 2;

    if (scene.requiredItem === itemId) {
      if ((itemId === 'blanket' && isBabyZone) || (itemId === 'sheet' && isMotherZone)) {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
        setTransitioning(true);
        setUsedItems(prev => [...prev, itemId]);
        addScore(50);

        setTimeout(() => {
          const nextIndex = sceneIndex + 1;
          setSceneIndex(nextIndex);
          setTransitioning(false);
          
          if (nextIndex === SCENE_PROGRESSION.length - 1) {
            setTimeout(() => setShowSuccess(true), 800);
          }
        }, 400);

        return true;
      }
    }
    return false;
  };

  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => {
    return scene.requiredItem !== id;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {/* Top Inventory Tray */}
      {!isDone && (
        <ItemTray 
          items={TRAY_ITEMS}
          usedItems={usedItems}
          lockedItems={lockedItems}
          onDrop={handleDrop}
          onProximity={handleProximity}
          position="top"
        />
      )}

      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View key={s.id} entering={FadeIn.duration(500)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
            <ImageBackground source={s.image} style={{ flex: 1, width: '100%' }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.5)' }} pointerEvents="none" />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.75)' }} pointerEvents="none" />

      {/* Invisible Drop Zones */}
      {sceneIndex === 0 && (
        <View style={{ position: 'absolute', bottom: '20%', right: '10%', width: 140, height: 140, zIndex: 10 }}>
          <DropZone id="baby" activeZoneId={activeDropZone} style={{ flex: 1 }} />
        </View>
      )}
      {sceneIndex === 1 && (
        <View style={{ position: 'absolute', top: '40%', left: '10%', width: 200, height: 200, zIndex: 10 }}>
          <DropZone id="mother" activeZoneId={activeDropZone} style={{ flex: 1 }} />
        </View>
      )}

      {/* Persistent Blankets/Sheets overlay if placed */}
      {sceneIndex >= 1 && (
        <Animated.View entering={FadeIn.duration(800)} style={{ position: 'absolute', bottom: '25%', right: '15%', zIndex: 1, opacity: 0.9 }} pointerEvents="none">
          <Image source={require('../assets/images/blanket.png')} style={{ width: 120, height: 120 }} resizeMode="contain" />
        </Animated.View>
      )}
      {sceneIndex >= 2 && (
        <Animated.View entering={FadeIn.duration(800)} style={{ position: 'absolute', top: '35%', left: '5%', zIndex: 1, opacity: 0.8 }} pointerEvents="none">
          <Image source={require('../assets/images/clean_sheet.png')} style={{ width: 220, height: 220, transform: [{ rotate: '-10deg' }] }} resizeMode="contain" />
        </Animated.View>
      )}

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }} pointerEvents="box-none">
        
        {/* Header pushed down slightly if tray is active */}
        <View pointerEvents="none" style={{ marginTop: !isDone ? 110 : 0 }}>
          <StepHeader step={16} score={score} instruction="" />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>WARM AND SAFE</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }} pointerEvents="box-none">
          
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 6 }}>
            {['Cover Baby', 'Cover Mother'].map((name, i) => {
              const done = sceneIndex > i;
              return (
                <View key={i} style={{ 
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14,
                  backgroundColor: done ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.15)',
                  borderWidth: 1.5, borderColor: done ? '#A7F3D0' : 'rgba(255,255,255,0.2)',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 }}>{name}</Text>
                </View>
              );
            })}
          </View>

          <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.12)', 
              borderRadius: 20, padding: 18, marginBottom: 16, 
              borderWidth: 1, 
              borderColor: 'rgba(255,255,255,0.2)' 
            }}
            pointerEvents="none"
          >
            {scene.requiredItem && (
              <Text style={{ color: '#FCD34D', fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 4 }}>
                DRAG ITEM 👆
              </Text>
            )}
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>{scene.instruction}</Text>
          </Animated.View>

        </View>

        <StepNavigation currentStep={16} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay message="Both are warm and safe. Good job preserving body heat!" 
          onComplete={() => { setShowSuccess(false); markStepComplete(16); }} />
      )}
    </View>
  );
}
