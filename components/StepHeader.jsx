import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STEP_ALERTS = {
  1: "You must prepare the room first!\nMake sure it is clean, warm, and well-lit.",
  2: "Lay the plastic sheet down first!\nIt protects the surface underneath from fluids during delivery.",
  3: "Add soap first! Washing without soap does not remove dangerous bacteria that can infect the mother and baby.",
  4: "You are missing items! You need everything ready before delivery starts.\nYou cannot leave mama to find things once baby starts coming!",
  5: "STOP! These scissors are not sterilized!\nUsing dirty scissors on the umbilical cord causes tetanus and deadly infection.\nBoil them first!",
  6: "Lying flat makes delivery much harder!\nSemi-sitting uses gravity to help baby move down naturally. Raise her back up!",
  7: "Do not push yet! Pushing before the right time can cause tearing and exhaustion.\nWait for the strong urge!",
  8: "Do NOT pull the baby's head!\nPulling causes serious neck injury.\nSupport gently and let baby come naturally.",
  9: "Always check for cord around the neck!\nCord around neck is common and manageable if caught immediately.",
  10: "Guide the upper shoulder first!\nPulling the lower shoulder first can cause shoulder injury to baby.",
  11: "Not yet! Leave the cord attached.\nBaby is still receiving oxygen-rich blood.\nWait 1-3 minutes before cutting.",
  12: "NEVER shake a baby!\nShaking causes serious brain injury.\nGently rub the back and tap the feet only.",
  13: "Tie TWICE before cutting!\nAn untied cord bleeds heavily and causes dangerous blood loss in baby.",
  14: "NEVER pull the cord!\nPulling causes the placenta to tear and causes life threatening bleeding.\nWait for it to come naturally!",
  15: "Keep massaging! The uterus must feel firm like a ball.\nA soft uterus means dangerous bleeding can start at any time.",
  16: "Cover the baby immediately!\nNewborns lose body heat very fast and hypothermia can be fatal within minutes in cold conditions.",
  17: "Breastfeed within the first hour!\nColostrum is the baby's first vaccine.\nIt protects from infection and helps stop mother's bleeding.",
};

const STEP_TIPS = {
  1: "Close windows for warmth, turn on the light, and clean the bed surface.",
  2: "Layer: plastic sheet → clean sheet → towel. This protects the mattress.",
  3: "Wash hands with soap for at least 20 seconds, then put on sterile gloves.",
  4: "Gather all supplies within arm's reach. You won't be able to leave once delivery starts!",
  5: "Boil scissors and string for 20 minutes to sterilize them.",
  6: "Semi-reclined position with pillows. Knees bent, feet flat.",
  7: "Breathe in for 4 seconds, out for 4 seconds. This helps manage contractions.",
  8: "Place a clean towel below to cushion the baby's head during crowning.",
  9: "If cord is around neck, gently slip it over the head. Never cut before delivery!",
  10: "Guide gently — never pull! Let the baby's shoulders deliver one at a time.",
  11: "Dry baby immediately with a towel. Skin-to-skin contact keeps baby warm.",
  12: "Rub baby's back and tap feet to stimulate breathing. Never shake!",
  13: "Tie cord in TWO places, then cut between the ties with sterile scissors.",
  14: "Wait for the placenta to deliver naturally. It can take 5-30 minutes.",
  15: "Firm circular massage below the navel helps the uterus contract and stops bleeding.",
  16: "Cover baby with a blanket, cover mother with a clean sheet to retain body heat.",
  17: "Early breastfeeding provides colostrum (antibodies) and helps stop bleeding.",
};

const STEP_ORDER = [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export default function StepHeader({ step, totalSteps = 17, score = 0 }) {
  const router = useRouter();
  const { isStepComplete } = useGame();
  const [showTip, setShowTip] = useState(false);

  const currentIndex = STEP_ORDER.indexOf(step);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEP_ORDER.length - 1;
  const progress = ((currentIndex + 1) / STEP_ORDER.length) * 100;
  
  const completed = isStepComplete(step);

  const handlePrevious = () => {
    if (!isFirst) {
      const prevStepNum = STEP_ORDER[currentIndex - 1];
      const prevStep = String(prevStepNum).padStart(2, '0');
      router.push(`/step${prevStep}`);
    }
  };

  const handleNext = () => {
    if (!completed) {
      Alert.alert(
        '⚠️ Step Not Complete!',
        STEP_ALERTS[step] || 'Complete this step before moving on!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    if (isLast) {
      router.push('/complete');
    } else {
      const nextStepNum = STEP_ORDER[currentIndex + 1];
      const nextStep = String(nextStepNum).padStart(2, '0');
      router.push(`/step${nextStep}`);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ paddingHorizontal: 12, paddingTop: 4 }}>
      {/* Top row: PREV | Step + Score | NEXT */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        {/* Prev button */}
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={isFirst}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: isFirst ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 30,
            opacity: isFirst ? 0.4 : 1,
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={18} color="#FFFFFF" />
          <Text style={{ fontWeight: '800', color: '#FFFFFF', fontSize: 12, letterSpacing: 0.5 }}>PREV</Text>
        </TouchableOpacity>

        {/* Center: Step counter + score */}
        <View style={{ alignItems: 'center', flex: 1, paddingHorizontal: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>
                Step {currentIndex + 1}/{totalSteps}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 }}>
              <Text style={{ color: '#FBBF24', fontSize: 13, fontWeight: '900' }}>🏆 {score}</Text>
            </View>
            {completed && (
              <View style={{ backgroundColor: 'rgba(16,185,129,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14 }}>
                <Text style={{ color: '#34D399', fontSize: 11, fontWeight: '900' }}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: completed ? '#10B981' : '#F59E0B',
            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 30,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
          }}
        >
          <Text style={{ fontWeight: '800', color: '#FFFFFF', fontSize: 12, letterSpacing: 0.5 }}>
            {isLast ? 'FINISH' : 'NEXT'}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
        <View style={{ height: '100%', backgroundColor: '#60A5FA', borderRadius: 2, width: `${progress}%` }} />
      </View>

      {/* Tips button row */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
        <TouchableOpacity
          onPress={() => setShowTip(!showTip)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: showTip ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.1)',
            paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
            borderWidth: 1, borderColor: showTip ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.15)',
          }}
        >
          <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color={showTip ? '#60A5FA' : '#FFFFFF'} />
          <Text style={{ color: showTip ? '#60A5FA' : '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
            {showTip ? 'HIDE TIP' : 'SHOW TIP'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tip popup (center modal) */}
      <Modal
        transparent
        visible={!!showTip && !!STEP_TIPS[step]}
        animationType="fade"
        onRequestClose={() => setShowTip(false)}
      >
        <Pressable
          onPress={() => setShowTip(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: 'rgba(17,24,39,0.96)',
              borderRadius: 22,
              paddingVertical: 18,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: 'rgba(96,165,250,0.45)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#60A5FA" />
                <Text style={{ color: '#BFDBFE', fontSize: 13, fontWeight: '900', letterSpacing: 1 }}>TIP</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTip(false)} activeOpacity={0.8} style={{ padding: 6 }}>
                <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#E5E7EB', fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 22 }}>
              {STEP_TIPS[step]}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

