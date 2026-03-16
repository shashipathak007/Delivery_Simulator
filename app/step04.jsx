import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeInDown, ZoomIn, ZoomOut, SlideInUp,
  useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming, withRepeat
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import StepHeader from '../components/StepHeader';
import SuccessOverlay from '../components/SuccessOverlay';
import StepNavigation from '../components/StepNavigation';
import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';

const { width, height } = Dimensions.get('window');

const ITEMS_TO_COLLECT = [
  { id: '1', name: 'Plastic Sheet', source: require('../assets/images/plastic.png') },
  { id: '2', name: 'Towels', source: require('../assets/images/towel.png') },
  { id: '3', name: 'Soap', source: require('../assets/images/soap.png') },
  { id: '4', name: 'Scissors', source: require('../assets/images/scissors.png') },
  { id: '5', name: 'String', source: require('../assets/images/string.png') },
  { id: '6', name: 'Blanket', source: require('../assets/images/blanket.png') },
  { id: '7', name: 'Warm Water', source: require('../assets/images/warm_bowl.png') },
  { id: '8', name: 'Gloves', source: require('../assets/images/gloves.png') }
];

// Random positioning
const positions = ITEMS_TO_COLLECT.map((_, i) => ({
  top: 150 + Math.random() * (height * 0.25),
  left: 30 + Math.random() * (width - 120),
}));

const PulsingIndicator = ({ icon = "basket-unfill" }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.3, { duration: 1000 }), -1, true);
    opacity.value = withRepeat(withTiming(0.1, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ position: 'absolute', top: -30, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.4)' }, animStyle]} />
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' }}>
        <MaterialCommunityIcons name={icon} size={28} color="#111" />
      </View>
    </View>
  );
};

function DraggableCollectable({ item, initialPos, onCollect }) {
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const checkDrop = (x, y) => {
    // If dragged to the bottom part of the screen where the kit is
    if (y > height - 350) {
      onCollect(item);
    } else {
      dragX.value = withSpring(0);
      dragY.value = withSpring(0);
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      try { runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
    })
    .onUpdate((e) => {
      dragX.value = e.translationX;
      dragY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(checkDrop)(e.absoluteX, e.absoluteY);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value },
      { scale: isDragging.value ? 1.2 : 1 }
    ],
    zIndex: isDragging.value ? 999 : 1
  }));

  return (
    <Animated.View style={[{ position: 'absolute', top: initialPos.top, left: initialPos.left }, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Image source={item.source} style={{ width: 45, height: 45 }} resizeMode="contain" />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function Step04() {
  const router = useRouter();
  const { addScore, score, markStepComplete } = useGame();
  const { addToInventory } = useInventory();
  
  const [collectedItems, setCollectedItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCollect = (item) => {
    if (collectedItems.includes(item.id)) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    
    setCollectedItems(prev => [...prev, item.id]);
    addToInventory({ ...item, type: 'image' });
    addScore(10);
  };

  useEffect(() => {
    if (collectedItems.length === ITEMS_TO_COLLECT.length) {
      setTimeout(() => {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
        markStepComplete(4);
      }, 1500);
    }
  }, [collectedItems]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" />

      {/* Blurred background scene */}
      <ImageBackground source={require('../assets/images/Starting_Page.png')} style={{ flex: 1, position: 'absolute', top: -80, left: 0, right: 0, bottom: 0, zIndex: 1 }} blurRadius={10} />
      
      {/* Dark overlay */}
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

      {/* Items to click */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }} pointerEvents="box-none">
        {ITEMS_TO_COLLECT.map((item, index) => {
          const isCollected = collectedItems.includes(item.id);
          
          return !isCollected && (
            <DraggableCollectable 
              key={item.id} 
              item={item} 
              initialPos={positions[index]} 
              onCollect={handleCollect} 
            />
          );
        })}
      </View>

      <SafeAreaView style={{ flex: 1, zIndex: 4, justifyContent: 'space-between' }} pointerEvents="box-none">
        <View pointerEvents="none">
          <StepHeader step={4} score={score} instruction="" />
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom Panel (Inventory Tracker) */}
        <Animated.View entering={SlideInUp.delay(300)} style={{ paddingHorizontal: 20, paddingBottom: 110 }} pointerEvents="box-none">
          
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            
            {collectedItems.length < ITEMS_TO_COLLECT.length && <PulsingIndicator icon="archive-arrow-down" />}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>EMERGENCY KIT</Text>
              <View style={{ backgroundColor: 'rgba(59,130,246,0.3)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.5)' }}>
                <Text style={{ color: '#93C5FD', fontWeight: '900', fontSize: 14 }}>{collectedItems.length} / {ITEMS_TO_COLLECT.length}</Text>
              </View>
            </View>

            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '700', marginBottom: 16 }}>
              Tap the floating items to gather them.
            </Text>

            {/* Collected items grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {ITEMS_TO_COLLECT.map((item) => {
                const isCollected = collectedItems.includes(item.id);
                return (
                  <View key={`inv-${item.id}`} style={{
                    width: '22%', aspectRatio: 1,
                    backgroundColor: isCollected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.05)',
                    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: isCollected ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                  }}>
                    {isCollected && (
                      <Animated.View entering={ZoomIn}>
                        <Image source={item.source} style={{ width: 35, height: 35 }} resizeMode="contain" />
                      </Animated.View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

        </Animated.View>

        <View pointerEvents="auto">
          <StepNavigation currentStep={4} />
        </View>
      </SafeAreaView>

      {/* No success popups */}
    </GestureHandlerRootView>
  );
}
