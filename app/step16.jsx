import React, { useState } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Animated, { FadeIn, SlideInRight, BounceIn, useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import GameStep from '../components/GameStep';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'blanket', name: 'Blanket', type: 'image', icon: require('../assets/images/blanket.png') },
  { id: 'blanket2', name: 'Blanket', type: 'image', icon: require('../assets/images/blanket.png') }
];

const SCENE_PROGRESSION = [
  { id: 'exposed', image: require('../assets/images/Baby_On_MothersChest.png'), instruction: 'Drag BLANKET to cover the baby.', requiredItem: 'blanket' },
  { id: 'baby_covered', image: require('../assets/images/CoverBaby.png'), instruction: 'Baby warm! Drag BLANKET to cover mother.', requiredItem: 'blanket2' },
  { id: 'all_covered', image: require('../assets/images/Mother_And_BabyCovered.png'), instruction: 'Both are warm, safe, and resting.' },
];

const PulsingIndicator = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.15, { duration: 1000 }), -1, true);
  }, []);
  // const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  // return (
  //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
  //     <Animated.View style={[{ position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,200,50,0.3)' }, animStyle]} />
  //     {/* <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,200,50,0.85)', justifyContent: 'center', alignItems: 'center' }}>
  //       <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF' }} />
  //     </View> */}
  //   </View>
  // );
};

export default function Step16() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [usedItems, setUsedItems] = useState([]);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleProximity = (itemId, x, y) => {
    const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
    setActiveDropZone(distance < 400 ? 'target' : null);
  };

  const handleDrop = (itemId, x, y) => {
    setActiveDropZone(null);
    if (transitioning || isDone) return false;
    const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
    if (distance < 400 && scene.requiredItem === itemId) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
      setTransitioning(true);
      setUsedItems(prev => [...prev, itemId]);
      addScore(50);
      setTimeout(() => {
        const next = sceneIndex + 1;
        setSceneIndex(next);
        setTransitioning(false);
        if (next === SCENE_PROGRESSION.length - 1) setTimeout(() => markStepComplete(16), 1500);
      }, 400);
      return true;
    }
    return false;
  };

  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => scene.requiredItem !== id);

  return (
    <GameStep
      step={16}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={sceneIndex}
      isDone={isDone}
      showConfetti={isDone}
      topContent={!isDone && (
        <ItemTray items={TRAY_ITEMS} usedItems={usedItems} lockedItems={lockedItems} onDrop={handleDrop} onProximity={handleProximity} position="top" />
      )}
    >
      {/* Large Drop Zone */}
      <View style={{ position: 'absolute', top: '15%', left: 0, width: '100%', height: '70%', zIndex: 10 }}>
        {!isDone && <PulsingIndicator icon="tray-arrow-down" />}
        <DropZone id="target" activeZoneId={activeDropZone} style={{ flex: 1 }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none" />

      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }} pointerEvents="box-none">
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' }} pointerEvents="none">
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>
      </View>
    </GameStep>
  );
}
