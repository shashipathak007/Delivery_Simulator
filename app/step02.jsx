import React, { useState, useCallback } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  SlideInRight, BounceIn,
  useSharedValue, useAnimatedStyle, withTiming, withRepeat
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import GameStep from '../components/GameStep';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'plastic', name: 'Plastic', type: 'image', icon: require('../assets/images/plastic.png') },
  { id: 'sheet', name: 'Sheet', type: 'image', icon: require('../assets/images/clean_sheet.png') },
  { id: 'towel', name: 'Towel', type: 'image', icon: require('../assets/images/towel.png') }
];

const SCENE_PROGRESSION = [
  {
    id: 'clean_bed',
    image: require('../assets/images/Clean_Bed.jpg'),
    instruction: 'Drag the PLASTIC SHEET onto the bed.',
    tipText: 'Plastic protects mattress from fluids.',
    requiredItem: 'plastic',
  },
  {
    id: 'plastic_on',
    image: require('../assets/images/Plastic_Layer.jpg'),
    instruction: 'Drag the CLEAN SHEET onto the bed.',
    tipText: 'Clean sheet goes on top of plastic.',
    requiredItem: 'sheet',
  },
  {
    id: 'sheet_on',
    image: require('../assets/images/Sheet_Layer.jpg'),
    instruction: 'Drag a TOWEL onto the bed.',
    tipText: 'Towels absorb fluids.',
    requiredItem: 'towel',
  },
  {
    id: 'towel_on',
    image: require('../assets/images/Towel_Layer.jpg'),
    instruction: 'All layers placed! Bed is ready.',
  },
];


export default function Step02() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [usedItems, setUsedItems] = useState([]);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleProximity = (itemId, x, y) => {
    const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
    setActiveDropZone(distance < 400 ? 'bed' : null);
  };

  const handleDrop = (itemId, x, y) => {
    if (transitioning || isDone) return false;
    setActiveDropZone(null);

    const distance = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
    if (distance < 400 && scene.requiredItem === itemId) {
      setTransitioning(true);
      setUsedItems(prev => [...prev, itemId]);
      addScore(50);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}

      setTimeout(() => {
        const nextIndex = sceneIndex + 1;
        setSceneIndex(nextIndex);
        setTransitioning(false);
        if (nextIndex === SCENE_PROGRESSION.length - 1) {
          setTimeout(() => markStepComplete(2), 1500);
        }
      }, 300);
      return true;
    }
    return false;
  };

  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => scene.requiredItem !== id);

  return (
    <GameStep
      step={2}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={sceneIndex}
      isDone={isDone}
      showConfetti={isDone}
      statusTitle="BED READY"
      statusDetail="SAFE & CLEAN"
      topContent={
        <ItemTray
          items={TRAY_ITEMS}
          usedItems={usedItems}
          lockedItems={lockedItems}
          onDrop={handleDrop}
          onProximity={handleProximity}
          position="top"
        />
      }
    >
      {/* Massive Drop Zone */}
      <View style={{ position: 'absolute', top: '15%', left: 0, width: '100%', height: '70%', zIndex: 10 }}>
        {/* Pulsing indicator removed */}
        <DropZone id="bed" activeZoneId={activeDropZone} style={{ flex: 1 }} />
      </View>

      {/* Center badge removed - now in GameStep */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      </View>

      {/* Bottom */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }} pointerEvents="box-none">
        <Animated.View
          key={`instr-${sceneIndex}`}
          entering={SlideInRight.duration(400)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20,
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
          }}
          pointerEvents="none"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>
            {scene.instruction}
          </Text>
          {scene.tipText && (
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              {scene.tipText}
            </Text>
          )}
        </Animated.View>
      </View>
    </GameStep>
  );
}
