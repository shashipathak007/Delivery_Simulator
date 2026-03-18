import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeInUp, SlideInRight, ZoomIn,
  useSharedValue, useAnimatedStyle, withTiming, withRepeat
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GameStep from '../components/GameStep';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  
  { id: 'sanitizer', name: 'Sanitizer', type: 'image', icon: require('../assets/images/soap.png') },
  { id: 'gloves', name: 'Clean Gloves', type: 'image', icon: require('../assets/images/gloves on hand.png') },
];

const SCENE_PROGRESSION = [
  {
    id: 'nails_dirty',
    image: require('../assets/images/dirty_OvergrownNails.png'),
    instruction: 'Trim long nails before assisting.',
    actionLabel: 'TRIM NAILS',
  },
  {
    id: 'nails_trimmed',
    image: require('../assets/images/TrimmedNails.png'),
    instruction: 'Great. Now remove rings and bracelets.',
    actionLabel: 'REMOVE ACCESSORIES',
  },
  {
    id: 'accessories_removed',
    image: require('../assets/images/Remove_Accessories.png'),
    instruction: 'Wash hands with sanitizer by dragging it from the top.',
    requiredItem: 'sanitizer',
  },
  {
    id: 'washing',
    image: require('../assets/images/washing Hands.png'),
    instruction: 'Sanitizing... keep going!',
  },
  {
    id: 'clean',
    image: require('../assets/images/clean hands.png'),
    instruction: 'Hands are clean. Wear clean gloves by dragging them from the top.',
    requiredItem: 'gloves',
  },
  {
    id: 'gloved',
    image: require('../assets/images/gloves on hand.png'),
    instruction: 'Gloves on! Hands are sterile.',
  },
];

const PulsingIndicator = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.15, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // return (
  //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
  //     <Animated.View style={[{
  //       position: 'absolute', width: 80, height: 80, borderRadius: 40,
  //       backgroundColor: 'rgba(56,189,248,0.3)',
  //     }, animStyle]} />
  //     <View style={{
  //       width: 40, height: 40, borderRadius: 20,
  //       backgroundColor: 'rgba(56,189,248,0.85)',
  //       justifyContent: 'center', alignItems: 'center',
  //     }}>
  //       <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF' }} />
  //     </View>
  //   </View>
  // );
};

export default function Step03() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [washProgress, setWashProgress] = useState(0);
  const [usedItems, setUsedItems] = useState([]);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const progressWash = useCallback(() => {
    let count = 0;
    const totalTicks = 12; // ~3.6s total (12 * 300ms)
    const interval = setInterval(() => {
      count++;
      setWashProgress(Math.round((count / totalTicks) * 100));
      if (count >= totalTicks) {
        clearInterval(interval);
        addScore(50);
        setSceneIndex(4); // move to "clean" after sanitizing
        setTransitioning(false);
        setWashProgress(0);
      }
    }, 300);
  }, []);

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    setTransitioning(true);
    addScore(25);
    setTimeout(() => {
      setSceneIndex((idx) => Math.min(idx + 1, SCENE_PROGRESSION.length - 1));
      setTransitioning(false);
    }, 250);
  }, [transitioning, isDone]);

  const handleProximity = (itemId, x, y) => {
    const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
    setActiveDropZone(distance < 400 ? 'hands' : null);
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);
    const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));

    if (distance < 400 && scene.requiredItem === itemId) {
      setUsedItems(prev => [...prev, itemId]);
      addScore(50);

      // Sanitizer triggers the washing animation phase
      if (itemId === 'sanitizer') {
        setTransitioning(true);
        setSceneIndex(3); // washing
        progressWash();
        return true;
      }

      // Gloves completes the step
      if (itemId === 'gloves') {
        const nextIndex = sceneIndex + 1;
        setSceneIndex(nextIndex);
        if (nextIndex === SCENE_PROGRESSION.length - 1) {
          setTimeout(() => markStepComplete(3), 1500);
        }
        return true;
      }
    }
    return false;
  };

  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => scene.requiredItem !== id);

  const scenes = SCENE_PROGRESSION.map(s => ({
    id: s.id,
    image: s.image,
    resizeMode: 'contain',
  }));

  return (
    <GameStep
      step={3}
      score={score}
      scenes={scenes}
      sceneIndex={sceneIndex}
      isDone={isDone}
      showConfetti={isDone}
      statusTitle="HANDS STERILE"
      statusDetail="SAFE TO ASSIST"
      topContent={
        isDone ? null : (
          <ItemTray
            items={TRAY_ITEMS}
            usedItems={usedItems}
            lockedItems={lockedItems}
            onDrop={handleDrop}
            onProximity={handleProximity}
            position="top"
          />
        )
      }
    >
      {/* Large Drop Zone */}
      <View style={{ position: 'absolute', top: '15%', left: 0, width: '100%', height: '70%', zIndex: 10 }}>
        {!isDone && scene.requiredItem && <PulsingIndicator icon="hand-wash" />}
        <DropZone id="hands" activeZoneId={activeDropZone} style={{ flex: 1 }} />
      </View>

      {/* Center */}
      <View style={{ flex: 1 }} pointerEvents="none">
        {sceneIndex === 3 && (
          <Animated.View entering={ZoomIn} style={{ position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(37,99,235,0.9)', paddingHorizontal: 26, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#93C5FD' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 2, textAlign: 'center' }}>SANITIZING...</Text>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 10, width: 220 }}>
                <View style={{ height: 6, backgroundColor: '#FFFFFF', borderRadius: 3, width: `${washProgress}%` }} />
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Bottom */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }} pointerEvents="box-none">
        <Animated.View 
  key={`instr-${sceneIndex}`}
  entering={SlideInRight.duration(400)}
  style={{
  position: 'relative',
  backgroundColor: 'rgba(0,0,0,0.5)',
  borderRadius: 24,
  padding: 20,
  borderWidth: 1.5,
  borderColor: 'rgba(255,255,255,0.15)',
  marginBottom: scene.actionLabel ? 14 : 0,
  
}}
  pointerEvents="none"
>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>
            {scene.instruction}
          </Text>
        </Animated.View>

        {scene.actionLabel && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ zIndex: 10 }}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
              style={{
                backgroundColor: transitioning ? '#6B7280' : '#2563EB', borderRadius: 18, paddingVertical: 18,
                alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4, shadowRadius: 12,
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </GameStep>
  );
}
