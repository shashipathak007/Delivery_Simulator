import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, Dimensions, Image } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'towel', name: 'Clean Towel', type: 'image', icon: require('../assets/images/towel.png') }
];

const SCENE_PROGRESSION = [
  { id: 'initial', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Baby isn\'t crying loudly. Rub the back to stimulate breathing!', actionLabel: 'RUB BABY\'S BACK' },
  { id: 'rubbing', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Keep rubbing gently...', actionLabel: 'RUB BACK', isInteractive: true },
  { id: 'tapping', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Now tap the soles of the feet!', actionLabel: 'TAP FEET', isInteractive: true },
  { id: 'crying', image: require('../assets/images/BabyCries.png'), instruction: 'Baby is crying loudly and breathing well!' },
];

export default function Step12() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [rubCount, setRubCount] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === 3;

  const isScreenTapInteractive = sceneIndex === 2; // Only feet tapping remains tap-anywhere

  const handleProximity = (itemId, x, y) => {
    if (sceneIndex === 1 && itemId === 'towel') {
      if (y > height * 0.3 && y < height * 0.7) {
        setActiveDropZone('baby');
        return;
      }
    }
    setActiveDropZone(null);
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);
    if (sceneIndex === 1 && itemId === 'towel') {
      if (y > height * 0.3 && y < height * 0.7) {
        const n = rubCount + 1;
        setRubCount(n);
        addScore(10);
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
        if (n >= 5) {
          setTransitioning(true);
          setTimeout(() => { setSceneIndex(2); setTransitioning(false); }, 300);
        }
        return true;
      }
    }
    return false;
  };

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    
    // Scene 0 is still button-based to start
    if (sceneIndex === 0) { 
      setTransitioning(true); 
      setTimeout(() => { setSceneIndex(1); setTransitioning(false); }, 300); 
      return; 
    }
    
    // Scene 2 is tap feet
    if (sceneIndex === 2) {
      const n = tapCount + 1; 
      setTapCount(n); 
      addScore(10);
      if (n >= 5) { 
        setTransitioning(true); 
        setTimeout(() => { 
          setSceneIndex(3); 
          setTransitioning(false); 
          setTimeout(() => markStepComplete(12), 1500); 
        }, 300); 
      }
      return;
    }
  }, [sceneIndex, transitioning, isDone, tapCount]);

  return (
    <GameStep 
      step={12} 
      score={score} 
      scenes={SCENE_PROGRESSION} 
      sceneIndex={sceneIndex} 
      isDone={isDone} 
      showConfetti={isDone}
      topContent={sceneIndex === 1 && (
        <ItemTray 
          items={TRAY_ITEMS} 
          usedItems={[]} 
          onDrop={handleDrop} 
          onProximity={handleProximity} 
          position="top" 
        >
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8, marginBottom: 8, marginLeft: 16 }}>
             <View style={{ borderRadius: 16, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
               <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 20 }}>{rubCount}/5</Text>
             </View>
             <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, fontWeight: 'bold', textAlign: 'center' }}>Rubs</Text>
          </View>
        </ItemTray>
      )}
    >
      {/* Tap-anywhere interaction for RUB BACK and TAP FEET (keeps header usable) */}
      {isScreenTapInteractive && (
        <Pressable
          onPress={handleAction}
          disabled={transitioning || isDone}
          style={{ position: 'absolute', left: 0, right: 0, top: 110, bottom: 0, zIndex: 4 }}
        />
      )}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
        {sceneIndex === 1 && (
          <View style={{ position: 'absolute', width: 300, height: 400, zIndex: 5 }}>
            <DropZone id="baby" activeZoneId={activeDropZone} style={{ flex: 1 }} />
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        {sceneIndex === 1 && !isDone && (
          <Animated.View entering={ZoomIn} style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>RUBBING BACK... {rubCount}/5</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: '#4ADE80', borderRadius: 3, width: `${Math.min((rubCount / 5) * 100, 100)}%` }} />
            </View>
          </Animated.View>
        )}
        {sceneIndex === 2 && !isDone && (
          <Animated.View entering={ZoomIn} style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>TAPPING FEET... {tapCount}/5</Text>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: '#EC4899', borderRadius: 3, width: `${Math.min((tapCount / 5) * 100, 100)}%` }} />
            </View>
          </Animated.View>
        )}
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
        {scene.actionLabel && !isScreenTapInteractive && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.7}
              style={{ backgroundColor: transitioning ? '#6B7280' : (sceneIndex === 2 ? '#EC4899' : '#2563EB'), borderRadius: 18, paddingVertical: 20, alignItems: 'center', shadowColor: sceneIndex === 2 ? '#EC4899' : '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
