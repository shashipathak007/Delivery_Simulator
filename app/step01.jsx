import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeIn, SlideInRight, ZoomIn, BounceIn,
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const SCENE_PROGRESSION = [
  {
    id: 'start',
    image: require('../assets/images/First_Background.jpg'),
    instruction: 'This room needs to be prepared! Tap the screen to begin.',
    interactZone: { top: 0, left: 0, width: '100%', height: '100%' },
    interactType: 'tap',
  },
  {
    id: 'close_windows',
    image: require('../assets/images/First_Background.jpg'),
    instruction: 'Close the windows to control the temperature.',
    interactZone: { top: '15%', left: '30%', width: '40%', height: '40%' },
    interactType: 'tap',
  },
  {
    id: 'windows_closed',
    image: require('../assets/images/Closed_Window.jpg'),
    instruction: 'Windows closed! Now tap the lamp to turn it on.',
    interactZone: { top: '45%', right: '0%', width: '25%', height: '25%' },
    interactType: 'tap',
  },
  {
    id: 'lights_on',
    image: require('../assets/images/Lights_On.jpg'),
    instruction: 'Great! Now turn the fan off.',
    interactZone: { top: '0%', left: '25%', width: '50%', height: '20%' },
    interactType: 'tap',
  },
  {
    id: 'fans_off',
    image: require('../assets/images/Fan_Off.jpg'),
    instruction: 'Great! Now dust the bed to clean it.',
    interactZone: { top: '50%', left: '10%', right: '10%', bottom: '10%' },
    interactType: 'rub',
  },
  {
    id: 'room_ready',
    image: require('../assets/images/Clean_Bed.jpg'),
    instruction: 'Room is prepared! Warm, clean, and well-lit.',
  },
];


export default function Step01() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [rubProgress, setRubProgress] = useState(0);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleAction = useCallback(() => {
    if (transitioning || isDone) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { }
    setTransitioning(true);
    addScore(50);

    setTimeout(() => {
      const nextIndex = sceneIndex + 1;
      setSceneIndex(nextIndex);
      setTransitioning(false);
      setRubProgress(0);

      if (nextIndex === SCENE_PROGRESSION.length - 1) {
        setTimeout(() => markStepComplete(1), 1500);
      }
    }, 300);
  }, [sceneIndex, transitioning, isDone]);

  const handleRub = () => {
    if (transitioning || isDone || scene.interactType !== 'rub') return;
    setRubProgress(prev => {
      const newProgress = prev + 1;
      if (newProgress > 12 && !transitioning) {
        setTimeout(() => handleAction(), 0);
      }
      return newProgress;
    });
  };

  return (
    <GameStep
      step={1}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={sceneIndex}
      isDone={isDone}
      showConfetti={isDone}
      hideNav={sceneIndex === 0}
      statusTitle="ROOM READY"
      statusDetail="SAFE & WARM"
    >
      {/* Interaction Zones — rendered over images */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }} pointerEvents="box-none">
        {scene.interactZone && scene.interactType === 'tap' && (
          <TouchableOpacity
            style={{ position: 'absolute', ...scene.interactZone }}
            onPress={handleAction}
            activeOpacity={0.6}
          >
            {/* Pulsing indicator removed */}
          </TouchableOpacity>
        )}
        {scene.interactZone && scene.interactType === 'rub' && (
          <View
            style={{ position: 'absolute', ...scene.interactZone }}
            onStartShouldSetResponder={() => true}
            onResponderMove={handleRub}
          >
            {/* Pulsing indicator removed */}
            {/* Rub progress bar */}
            <View style={{
              // Keep this above the bottom instruction panel so it never covers text.
              position: 'absolute', bottom: 140, left: '20%', right: '20%',
              height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3,
            }}>
              <View style={{
                height: 6, backgroundColor: '#4ADE80', borderRadius: 3,
                width: `${Math.min(rubProgress * 8, 100)}%`,
              }} />
            </View>
          </View>
        )}
      </View>

      {/* Center badge removed - now in GameStep */}
      <View pointerEvents="none" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      </View>

      {/* Bottom instruction panel */}
      <View pointerEvents="box-none" style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View
          key={`instr-${sceneIndex}`}
          entering={SlideInRight.duration(400)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20,
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
          }}
        >
          <Text style={{
            color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26,
          }}>
            {scene.instruction}
          </Text>
        </Animated.View>

        {/* Progress dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 6 }}>
          {SCENE_PROGRESSION.slice(1).map((_, i) => (
            <View
              key={i}
              style={{
                width: sceneIndex > i ? 22 : 8, height: 8,
                borderRadius: 4,
                backgroundColor: sceneIndex > i ? '#4ADE80' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </View>
      </View>
    </GameStep>
  );
}
