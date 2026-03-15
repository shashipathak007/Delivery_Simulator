import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StatusBar, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeInUp, SlideInRight, ZoomIn
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
  { id: 'soap', name: 'Soap', type: 'image', icon: require('../assets/images/soap.png') },
  { id: 'gloves', name: 'Sterile Gloves', type: 'image', icon: require('../assets/images/gloves.png') }
];

const SCENE_PROGRESSION = [
  {
    id: 'dirty',
    image: require('../assets/images/dirty hands.jpg'),
    instruction: 'Hands are dirty and full of bacteria. Drag SOAP to hands!',
    requiredItem: 'soap',
    actionLabel: null,
  },
  {
    id: 'soapy',
    image: require('../assets/images/soap.png'),
    instruction: 'Soap applied! Now tap to wash hands thoroughly.',
    actionLabel: 'START WASHING',
    isWashStep: true,
  },
  {
    id: 'washing',
    image: require('../assets/images/washing Hands.png'),
    instruction: 'Scrubbing... keep washing thoroughly!',
    actionLabel: null,
    autoProgress: true,
  },
  {
    id: 'clean',
    image: require('../assets/images/clean hands.png'),
    instruction: 'Hands are clean! Drag GLOVES to your hands.',
    requiredItem: 'gloves',
    actionLabel: null,
  },
  {
    id: 'gloved',
    image: require('../assets/images/gloves on hand.png'),
    instruction: 'Gloves on! Hands are sterile and protected.',
    actionLabel: null,
  },
];

export default function Step03() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [washProgress, setWashProgress] = useState(0);
  const [usedItems, setUsedItems] = useState([]);
  
  const [activeDropZone, setActiveDropZone] = useState(null);
  
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const dropZoneRef = useRef(null);

  const progressWash = useCallback(() => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setWashProgress(count * 10);
      if (count >= 10) {
        clearInterval(interval);
        addScore(50);
        setSceneIndex(3);
        setTransitioning(false);
        setWashProgress(0);
      }
    }, 300);
  }, []);

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    setTransitioning(true);

    if (scene.isWashStep) {
      addScore(50);
      setSceneIndex(2);
      progressWash();
      return;
    }
  }, [sceneIndex, transitioning, isDone, scene]);

  // Handle Drag & Drop
  const handleProximity = (itemId, x, y) => {
    // Roughly the center of the screen
    const targetX = width / 2;
    const targetY = height / 2;

    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
    if (distance < 150) {
      setActiveDropZone('hands');
    } else {
      setActiveDropZone(null);
    }
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);

    const targetX = width / 2;
    const targetY = height / 2;
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

    if (distance < 150) {
      if (scene.requiredItem === itemId) {
        // Success
        setUsedItems(prev => [...prev, itemId]);
        addScore(50);
        
        const nextIndex = sceneIndex + 1;
        setSceneIndex(nextIndex);
        
        if (nextIndex === SCENE_PROGRESSION.length - 1) {
          setTimeout(() => setShowSuccess(true), 800);
        }
        return true;
      }
    }
    return false;
  };

  // Determine locked items for tray
  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => {
    if (scene.requiredItem && scene.requiredItem === id) return false;
    return true; // lock items not currently requested
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {/* Top Inventory Tray */}
      <ItemTray 
        items={TRAY_ITEMS}
        usedItems={usedItems}
        lockedItems={lockedItems}
        onDrop={handleDrop}
        onProximity={handleProximity}
        position="top"
      />

      {/* Full-screen background */}
      {SCENE_PROGRESSION.map((s, i) => (
        i === sceneIndex && (
          <Animated.View 
            key={s.id} 
            entering={FadeIn.duration(500)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}
          >
            <Image source={s.image} style={{ width: '100%', height: '60%' }} resizeMode="contain" />
          </Animated.View>
        )
      ))}

      {/* Invisible Drop Zone overlay in the center of screen */}
      <View style={{ position: 'absolute', top: '35%', left: '20%', width: '60%', height: '40%', zIndex: 10 }}>
        <DropZone id="hands" activeZoneId={activeDropZone} style={{ flex: 1 }} />
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.55)' }} pointerEvents="none" />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, zIndex: 2, backgroundColor: 'rgba(0,0,0,0.7)' }} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }} pointerEvents="box-none">
        
        {/* Header pushed down below the tray */}
        <View pointerEvents="none" style={{ marginTop: 110 }}>
          <StepHeader step={3} score={score} instruction="" />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
          {sceneIndex === 2 && (
            <Animated.View entering={ZoomIn} style={{ alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(37,99,235,0.9)', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 20, borderWidth: 2, borderColor: '#93C5FD' }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2, textAlign: 'center' }}>WASHING...</Text>
                <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 10, width: 180 }}>
                  <View style={{ height: 6, backgroundColor: '#FFFFFF', borderRadius: 3, width: `${washProgress}%` }} />
                </View>
              </View>
            </Animated.View>
          )}
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{ backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>HANDS STERILE</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 80 }} pointerEvents="box-none">
          <Animated.View 
            key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} 
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
            pointerEvents="none"
          >
            <Text style={{ color: '#FCD34D', fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 4 }}>
              {scene.requiredItem ? "DRAG ITEM 👆" : "INSTRUCTION"}
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>
              {scene.instruction}
            </Text>
          </Animated.View>

          {scene.actionLabel && (
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <TouchableOpacity 
                onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
                style={{ backgroundColor: transitioning ? '#6B7280' : '#2563EB', borderRadius: 18, paddingVertical: 18, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: transitioning ? '#4B5563' : '#1D4ED8', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <StepNavigation currentStep={3} />
      </SafeAreaView>

      {showSuccess && (
        <SuccessOverlay 
          message="Hands washed thoroughly and gloves on! Safe to assist delivery." 
          onComplete={() => { setShowSuccess(false); markStepComplete(3); }} 
        />
      )}
    </View>
  );
}
