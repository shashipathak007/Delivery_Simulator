import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, SlideInRight, ZoomIn, BounceIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import GameStep from '../components/GameStep';
import { useGame } from '../context/GameContext';

const SCENE_PROGRESSION = [
  {
    id: 'contractions',
    image: require('../assets/images/Contraction.png'),
    instruction: 'Strong contractions every 2–3 minutes.\nContractions lasting 45–60 seconds.',
    actionLabel: 'CONTINUE',
    badge: '💪 CONTRACTIONS',
    badgeDetail: 'Getting stronger',
    badgeColor: 'rgba(239,68,68,0.9)',
    badgeBorder: '#FCA5A5',
  },
  {
    id: 'mother_pushing',
    image: require('../assets/images/MotherPushing.png'),
    instruction: 'Mother feels a strong urge to push.\nEncourage her to push with each contraction.',
    actionLabel: 'CONTINUE',
    badge: '🤰 PUSHING',
    badgeDetail: 'Strong urge to push',
    badgeColor: 'rgba(245,158,11,0.9)',
    badgeBorder: '#FDE68A',
  },
  {
    id: 'water_break',
    image: require('../assets/images/MotherPushing.png'),
    instruction: 'Water bag breaks!\nThis is normal — it means the baby is coming soon.',
    actionLabel: 'CONTINUE',
    badge: '💧 WATER BREAKS',
    badgeDetail: 'Baby is coming!',
    badgeColor: 'rgba(59,130,246,0.9)',
    badgeBorder: '#93C5FD',
  },
  {
    id: 'crowning',
    image: require('../assets/images/Crowning.png'),
    instruction: 'Baby\'s head becomes visible at the vagina (crowning)!\nPlace a clean towel below to support it.',
    actionLabel: 'PLACE TOWEL BELOW HEAD',
    badge: '👶 CROWNING',
    badgeDetail: 'Baby\'s head is appearing',
    badgeColor: 'rgba(236,72,153,0.9)',
    badgeBorder: '#F9A8D4',
  },
  {
    id: 'supported',
    image: require('../assets/images/Towel_UnderBabyHead.png'),
    instruction: 'Towel placed! Head is supported and cushioned.',
  },
];

export default function Step08() {
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

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
      if (nextIndex === SCENE_PROGRESSION.length - 1) {
        setTimeout(() => markStepComplete(8), 1500);
      }
    }, 300);
  }, [sceneIndex, transitioning, isDone]);

  const getButtonColor = () => {
    if (transitioning) return '#6B7280';
    if (sceneIndex === 0) return '#EF4444'; // contractions - red
    if (sceneIndex === 1) return '#F59E0B'; // pushing - amber
    if (sceneIndex === 2) return '#3B82F6'; // water break - blue
    return '#EC4899'; // crowning - pink
  };

  return (
    <GameStep
      step={8}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={sceneIndex}
      isDone={isDone}
      showConfetti={isDone}
      statusTitle="HEAD SUPPORTED"
      statusDetail="SAFE & CUSHIONED"
    >
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 8 }} pointerEvents="none">
        {!isDone && scene.badge && (
          <Animated.View
            key={`badge-${sceneIndex}`}
            entering={ZoomIn.springify()}
            style={{
              backgroundColor: scene.badgeColor,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: scene.badgeBorder,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 2, textAlign: 'center' }}>
              {scene.badge}
            </Text>
            {scene.badgeDetail && (
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.8 }}>
                {scene.badgeDetail}
              </Text>
            )}
          </Animated.View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <Animated.View key={`instr-${sceneIndex}`} entering={SlideInRight.duration(400)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{scene.instruction}</Text>
        </Animated.View>

        {scene.actionLabel && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <TouchableOpacity onPress={handleAction} disabled={transitioning} activeOpacity={0.85}
              style={{ backgroundColor: getButtonColor(), borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: getButtonColor(), shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{scene.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Progress dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 6 }}>
          {SCENE_PROGRESSION.map((_, i) => (
            <View
              key={i}
              style={{
                width: sceneIndex >= i ? 22 : 8, height: 8,
                borderRadius: 4,
                backgroundColor: sceneIndex >= i ? '#4ADE80' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </View>
      </View>
    </GameStep>
  );
}
