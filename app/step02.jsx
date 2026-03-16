import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Alert, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeInUp, SlideInRight, ZoomIn, 
  useSharedValue, useAnimatedStyle, withTiming, withRepeat
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
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
    image: require('../assets/images/CleanBed.png'),
    instruction: 'The bed is clean. Now drag the PLASTIC SHEET to protect against fluids.',
    actionLabel: null,
    tipText: 'Plastic protects mattress from fluids during delivery.',
    requiredItem: 'plastic',
  },
  {
    id: 'plastic_on',
    image: require('../assets/images/CovewithPlastics.png'),
    instruction: 'Plastic sheet placed! Now drag the CLEAN SHEET.',
    actionLabel: null,
    tipText: 'The clean sheet goes on top of plastic for hygiene.',
    requiredItem: 'sheet',
  },
  {
    id: 'sheet_on',
    image: require('../assets/images/CoverWithSheet.png'),
    instruction: 'Sheet is on! Finally, drag a TOWEL for absorbing fluids.',
    actionLabel: null,
    tipText: 'Towels absorb fluids and provide a soft surface.',
    requiredItem: 'towel',
  },
  {
    id: 'towel_on',
    image: require('../assets/images/AddTowel.png'),
    instruction: 'All layers placed correctly! Bed is ready.',
    actionLabel: null,
    tipText: 'Layer order: Plastic → Sheet → Towel.',
  },
];

const PulsingIndicator = ({ icon = "gesture-double-tap" }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.1, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.2)' }, animStyle]} />
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }}>
        <MaterialCommunityIcons name={icon} size={28} color="#FFF" />
      </View>
    </View>
  );
};

export default function Step02() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [usedItems, setUsedItems] = useState([]);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const scene = SCENE_PROGRESSION[sceneIndex];
  const isDone = sceneIndex === SCENE_PROGRESSION.length - 1;

  const handleProximity = (itemId, x, y) => {
    const targetX = width / 2;
    const targetY = height / 2;
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
    if (distance < 400) {
      setActiveDropZone('bed');
    } else {
      setActiveDropZone(null);
    }
  };

  const handleDrop = (itemId, x, y) => {
    if (transitioning || isDone) return false;
    setActiveDropZone(null);

    const targetX = width / 2;
    const targetY = height / 2;
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

    if (distance < 400) {
      if (scene.requiredItem === itemId) {
        setTransitioning(true);
        setUsedItems(prev => [...prev, itemId]);
        addScore(50);
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
        
        setTimeout(() => {
          const nextIndex = sceneIndex + 1;
          setSceneIndex(nextIndex);
          setTransitioning(false);
          
          if (nextIndex === SCENE_PROGRESSION.length - 1) {
            // Automatically complete the step after 1.5s delay
            setTimeout(() => {
              markStepComplete(2);
            }, 1500);
          }
        }, 300);
        return true;
      }
    }
    return false;
  };

  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => {
    if (scene.requiredItem && scene.requiredItem === id) return false;
    return true; 
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
        i <= sceneIndex && (
          <Animated.View 
            key={s.id} 
            entering={FadeIn.duration(600)} 
            style={{ position: 'absolute', top: -80, left: 0, right: 0, bottom: 0, zIndex: 1 }}
          >
            <ImageBackground source={s.image} style={{ flex: 1, width: '100%', height: '115%' }} resizeMode="cover" />
          </Animated.View>
        )
      ))}

      {/* Invisible Drop Zone overlay - Massive zone per user request */}
      <View style={{ position: 'absolute', top: '15%', left: 0, width: '100%', height: '70%', zIndex: 10 }}>
        {!isDone && <PulsingIndicator icon="tray-arrow-down" />}
        <DropZone id="bed" activeZoneId={activeDropZone} style={{ flex: 1 }} />
      </View>

      {/* Dark overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 2 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, zIndex: 2 }}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }} pointerEvents="box-none">
        <View pointerEvents="none" style={{ marginTop: 110 }}>
          <StepHeader step={2} score={score} instruction="" />
        </View>

        {/* Center badge */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isDone && (
            <Animated.View entering={ZoomIn.springify()} style={{
              backgroundColor: 'rgba(16,185,129,0.9)', paddingHorizontal: 24, paddingVertical: 14,
              borderRadius: 20, borderWidth: 2, borderColor: '#A7F3D0',
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2 }}>BED READY</Text>
            </Animated.View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 110 }} pointerEvents="box-none">
          {/* Instruction */}
          <Animated.View 
            key={`instr-${sceneIndex}`}
            entering={SlideInRight.duration(400)} 
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 18,
              marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}
            pointerEvents="none"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', lineHeight: 24 }}>
              {scene.instruction}
            </Text>
            {scene.tipText && (
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                {scene.tipText}
              </Text>
            )}
          </Animated.View>
        </View>

        <View pointerEvents="auto">
          <StepNavigation currentStep={2} />
        </View>
      </SafeAreaView>

      {/* No success popups */}
    </View>
  );
}
