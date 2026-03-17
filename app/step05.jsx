import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Animated, {
  FadeInUp, ZoomIn, BounceIn,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import GameStep from '../components/GameStep';
import ItemTray from '../components/ItemTray';
import DropZone from '../components/DropZone';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const TRAY_ITEMS = [
  { id: 'scissors', name: 'Scissors', type: 'image', icon: require('../assets/images/scissors.png') },
  { id: 'string',   name: 'String',   type: 'image', icon: require('../assets/images/string.jpg') },
  { id: 'towel',    name: 'Towel',    type: 'image', icon: require('../assets/images/towel.png') },
];

const SCENE_PROGRESSION = [
  { id: 'boiling', image: require('../assets/images/kitchen_bg_step05.png') },
];

// ─── Layout constants ────────────────────────────────────────────────────────
// The three pot columns divide the screen into equal thirds.
// Vertical drop window: roughly the middle 60 % of the screen.
const POT_Y_TOP    = height * 0.20;
const POT_Y_BOTTOM = height * 0.80;
const POT_X = [
  { min: 0,             max: width * 0.33  }, // pot1 – scissors
  { min: width * 0.33,  max: width * 0.66  }, // pot2 – string
  { min: width * 0.66,  max: width          }, // pot3 – towel
];
const POT_IDS     = ['pot1', 'pot2', 'pot3'];
const ITEM_TO_POT = { scissors: 0, string: 1, towel: 2 };

export default function Step05() {
  const { addScore, score, markStepComplete } = useGame();

  const [inPot, setInPot] = useState({ scissors: false, string: false, towel: false });
  const [boiling,      setBoiling]      = useState(false);
  const [boilProgress, setBoilProgress] = useState(0);
  const [sterilized,   setSterilized]   = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const boilInterval = useRef(null);

  // ── Steam animation ──────────────────────────────────────────────────────
  const steamScale = useSharedValue(1);
  useEffect(() => {
    steamScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1.0, { duration: 1000 })
      ),
      -1,
      true
    );
    return () => { if (boilInterval.current) clearInterval(boilInterval.current); };
  }, []);

  const steamStyle = useAnimatedStyle(() => ({
    transform: [{ scale: steamScale.value }],
    opacity: boiling ? 0.9 : 0.3,
  }));

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isInDropWindow = (y) => y > POT_Y_TOP && y < POT_Y_BOTTOM;

  const potIndexFor = (itemId, x, y) => {
    if (!isInDropWindow(y)) return -1;
    const col = ITEM_TO_POT[itemId];
    if (col === undefined) return -1;
    const zone = POT_X[col];
    return (x >= zone.min && x < zone.max) ? col : -1;
  };

  // ── Proximity handler (highlight drop zone while dragging) ───────────────
  const handleProximity = useCallback((itemId, x, y) => {
    if (boiling || sterilized) { setActiveDropZone(null); return; }
    if (inPot[itemId])         { setActiveDropZone(null); return; }

    const col = potIndexFor(itemId, x, y);
    setActiveDropZone(col >= 0 ? POT_IDS[col] : null);
  }, [boiling, sterilized, inPot]);

  // ── Drop handler ─────────────────────────────────────────────────────────
  const handleDrop = useCallback((itemId, x, y) => {
    setActiveDropZone(null);
    if (boiling || sterilized) return false;
    if (inPot[itemId])         return false;

    const col = potIndexFor(itemId, x, y);
    if (col < 0) return false;

    setInPot(prev => ({ ...prev, [itemId]: true }));
    addScore(25);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    return true;
  }, [boiling, sterilized, inPot]);

  // ── Start boiling ────────────────────────────────────────────────────────
  const handleStartBoiling = () => {
    const { scissors, string, towel } = inPot;
    if (!scissors || !string || !towel || boiling) return;

    setBoiling(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}

    let count = 0;
    boilInterval.current = setInterval(() => {
      count++;
      setBoilProgress(count * 5);
      if (count >= 20) {
        clearInterval(boilInterval.current);
        setSterilized(true);
        addScore(100);
        setTimeout(() => markStepComplete(5), 1800);
      }
    }, 300);
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const usedItems  = Object.keys(inPot).filter(k => inPot[k]);
  const allInPot   = inPot.scissors && inPot.string && inPot.towel;
  const isDone     = sterilized;

  // ── Pot renderer (DRY) ────────────────────────────────────────────────────
  const renderPot = (itemId, potId, label, imageSource) => {
    const placed = inPot[itemId];
    return (
      <View style={{ alignItems: 'center', flex: 1 }}>
        {/* DropZone must NOT have pointerEvents blocked */}
        {!placed && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
            <DropZone id={potId} activeZoneId={activeDropZone} style={{ flex: 1 }} />
          </View>
        )}

        {/* Steam */}
        <Animated.View style={[steamStyle, { position: 'absolute', top: -40, zIndex: 5 }]}>
          <Text style={{ fontSize: 40 }}>♨️</Text>
        </Animated.View>

        {/* Pot */}
        <View style={{ width: 110, height: 100, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={require('../assets/images/metal_pot.png')}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            resizeMode="contain"
          />
          {/* Water / highlight overlay */}
          <View style={{
            position: 'absolute', bottom: 12,
            width: '70%', height: '40%',
            backgroundColor:
              activeDropZone === potId ? 'rgba(74,222,128,0.6)'
              : boiling               ? 'rgba(245,158,11,0.4)'
              :                         'rgba(96,165,250,0.3)',
            borderRadius: 15, zIndex: 1,
          }} />

          {placed && (
            <Animated.View entering={ZoomIn} style={{ zIndex: 2 }}>
              <Image source={imageSource} style={{ width: 50, height: 50 }} resizeMode="contain" />
            </Animated.View>
          )}
        </View>

        <Text style={{
          color: placed ? '#4ADE80' : '#FFF',
          fontWeight: '900', fontSize: 10, marginTop: 4,
          textShadowColor: '#000', textShadowRadius: 4,
        }}>
          {placed ? '✓ ' : ''}{label}
        </Text>
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GameStep
      step={5}
      score={score}
      scenes={SCENE_PROGRESSION}
      sceneIndex={0}
      isDone={isDone}
      showConfetti={isDone}
      statusTitle="TOOLS STERILE"
      statusDetail="SAFE TO PROCEED"
      topContent={
        !boiling && !sterilized && (
          <ItemTray
            items={TRAY_ITEMS}
            usedItems={usedItems}
            lockedItems={[]}
            onDrop={handleDrop}
            onProximity={handleProximity}
            position="top"
          />
        )
      }
    >
      {/* ── Pots area ── NOTE: NO pointerEvents="none" here so drags register */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 5 }}>

        {/* Boil progress bar */}
        {boiling && !sterilized && (
          <Animated.View entering={FadeInUp} style={{
            position: 'absolute', top: height * 0.05,
            width: '80%', zIndex: 20,
          }}>
            <Text style={{
              color: '#F59E0B', fontWeight: '900', textAlign: 'center',
              marginBottom: 10, letterSpacing: 2, fontSize: 18,
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
            }}>
              BOILING... {boilProgress}%
            </Text>
            <View style={{
              height: 14, backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: 7, overflow: 'hidden',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
            }}>
              <Animated.View style={{
                width: `${boilProgress}%`, height: '100%', backgroundColor: '#F59E0B',
              }} />
            </View>
          </Animated.View>
        )}

        {/* Three pots */}
        <View style={{
          flexDirection: 'row', gap: 10,
          alignItems: 'center', justifyContent: 'center',
          width: '100%', paddingHorizontal: 10,
        }}>
          {renderPot('scissors', 'pot1', 'SCISSORS', require('../assets/images/scissors.png'))}
          {renderPot('string',   'pot2', 'STRING',   require('../assets/images/string.jpg'))}
          {renderPot('towel',    'pot3', 'TOWEL',    require('../assets/images/towel.png'))}
        </View>
      </View>

      {/* ── Instruction + boil button ── */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 50 }}>
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 24, padding: 20,
          borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
        }}>
          <Text style={{
            color: '#FFF', fontSize: 16, fontWeight: '800',
            textAlign: 'center', lineHeight: 24,
          }}>
            {sterilized
              ? '✅ Tools are sterile and safe! Tap NEXT to proceed.'
              : boiling
              ? `Boiling… ${boilProgress}% — killing all harmful bacteria.`
              : !allInPot
              ? 'Drag scissors, string, and towel into their pots.'
              : 'All items ready! Tap the button below to start boiling.'}
          </Text>
        </View>

        {allInPot && !boiling && !sterilized && (
          <TouchableOpacity
            onPress={handleStartBoiling}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#F59E0B', borderRadius: 20,
              paddingVertical: 18, alignItems: 'center', marginTop: 15,
              shadowColor: '#F59E0B', shadowOpacity: 0.4,
              shadowRadius: 10, elevation: 5,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>
              🔥 START BOILING
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </GameStep>
  );
}