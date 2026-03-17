import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeInUp,
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

export default function Step05() {
  const { addScore, score, markStepComplete } = useGame();

  const [inPot, setInPot] = useState({ scissors: false, string: false, towel: false });
  const [boiling,      setBoiling]      = useState(false);
  const [sterilized,   setSterilized]   = useState(false);
  const [activeDropZone, setActiveDropZone] = useState(null);

  const boilTimeout = useRef(null);

  // Background changes based on items dropped
  let bgImage;
  if (boiling || sterilized) {
    bgImage = require('../assets/images/Boiling_Effect.jpg');
  } else if (inPot.towel) {
    bgImage = require('../assets/images/Added_Towel.jpg');
  } else if (inPot.string) {
    bgImage = require('../assets/images/Added_string.png');
  } else if (inPot.scissors) {
    bgImage = require('../assets/images/Added_Scissors.jpg');
  } else {
    // Note: repo currently contains Kitchen.jpg (not kitchen.png).
    bgImage = require('../assets/images/Kitchen.jpg');
  }

  const SCENE_PROGRESSION = [ { id: 'boil_scene', image: bgImage } ];


  // ── Drop handler ─────────────────────────────────────────────────────────
  const handleDrop = useCallback((itemId, x, y) => {
    setActiveDropZone(null);
    if (boiling || sterilized) return false;
    if (inPot[itemId])         return false;

    // Must be in middle of screen (roughly)
    const isInCenter = x > width * 0.2 && x < width * 0.8 && y > height * 0.3 && y < height * 0.7;
    if (!isInCenter) return false;

    // Enforce order: scissors → string → towel
    if (itemId === 'string' && !inPot.scissors) return false;
    if (itemId === 'towel' && (!inPot.scissors || !inPot.string)) return false;

    setInPot(prev => ({ ...prev, [itemId]: true }));
    addScore(25);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    return true;
  }, [boiling, sterilized, inPot]);

    // ── Proximity handler (highlight drop zone while dragging) ───────────────
  const handleProximity = useCallback((itemId, x, y) => {
    if (boiling || sterilized) { setActiveDropZone(null); return; }
    if (inPot[itemId])         { setActiveDropZone(null); return; }

    const isInCenter = x > width * 0.2 && x < width * 0.8 && y > height * 0.3 && y < height * 0.7;
    setActiveDropZone(isInCenter ? 'center_pot' : null);
  }, [boiling, sterilized, inPot]);


  // ── Start boiling ────────────────────────────────────────────────────────
  const handleStartBoiling = () => {
    const { scissors, string, towel } = inPot;
    if (!scissors || !string || !towel || boiling) return;

    setBoiling(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}

    boilTimeout.current = setTimeout(() => {
      setSterilized(true);
      addScore(100);
      setTimeout(() => markStepComplete(5), 1500);
    }, 3000);
  };

  useEffect(() => {
    return () => { if (boilTimeout.current) clearTimeout(boilTimeout.current); };
  }, [])

  // ── Derived state ─────────────────────────────────────────────────────────
  const usedItems  = Object.keys(inPot).filter(k => inPot[k]);
  const allInPot   = inPot.scissors && inPot.string && inPot.towel;
  const isDone     = sterilized;
  const requiredItem = !inPot.scissors ? 'scissors' : !inPot.string ? 'string' : !inPot.towel ? 'towel' : null;
  const lockedItems = TRAY_ITEMS.map(i => i.id).filter(id => id !== requiredItem);

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
            lockedItems={lockedItems}
            onDrop={handleDrop}
            onProximity={handleProximity}
            position="top"
          />
        )
      }
    >
      {/* ── Center Drop Zone Area ── */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 5 }}>
        
        {/* Invisible Drop Zone taking up middle of screen */}
        {!allInPot && !boiling && !sterilized && (
          <View style={{ position: 'absolute', top: '30%', left: '20%', width: '60%', height: '40%', zIndex: 10 }}>
            <DropZone id="center_pot" activeZoneId={activeDropZone} style={{ flex: 1, backgroundColor: activeDropZone ? 'rgba(74,222,128,0.2)' : 'transparent', borderRadius: 20 }} />
          </View>
        )}
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
              ? 'Boiling… killing all harmful bacteria.'
              : !allInPot
              ? `Drag ${requiredItem === 'scissors' ? 'SCISSORS' : requiredItem === 'string' ? 'STRING' : 'TOWEL'} anywhere in the middle of the screen.`
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