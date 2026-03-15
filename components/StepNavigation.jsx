import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STEP_ALERTS = {
  1: "Call for help FIRST before anything else!\nMedical help must be on the way even if you have to deliver the baby yourself.",
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
  18: "You must go to hospital even after a successful home birth!\nBaby needs vaccinations and checks, mother needs examination.\nThis is not optional!",
};

export default function StepNavigation({ currentStep, totalSteps = 18 }) {
  const router = useRouter();
  const { isStepComplete } = useGame();

  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;
  const completed = isStepComplete(currentStep);

  const handlePrevious = () => {
    if (!isFirst) {
      const prevStep = String(currentStep - 1).padStart(2, '0');
      router.push(`/step${prevStep}`);
    }
  };

  const handleNext = () => {
    if (!completed) {
      Alert.alert(
        '⚠️ Step Not Complete!',
        STEP_ALERTS[currentStep] || 'Complete this step before moving on!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (isLast) {
      router.push('/complete');
    } else {
      const nextStep = String(currentStep + 1).padStart(2, '0');
      router.push(`/step${nextStep}`);
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(300).springify()}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 36,
        paddingTop: 16,
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        zIndex: 200,
      }}
    >
      {/* Previous Button */}
      <TouchableOpacity
        onPress={handlePrevious}
        disabled={isFirst}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isFirst ? '#F3F4F6' : '#EFF6FF',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 50,
          borderWidth: 2,
          borderColor: isFirst ? '#E5E7EB' : '#BFDBFE',
          opacity: isFirst ? 0.5 : 1,
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 6, color: isFirst ? '#9CA3AF' : '#2563EB' }}>◀</Text>
        <Text style={{ fontWeight: '800', color: isFirst ? '#9CA3AF' : '#2563EB', fontSize: 15, letterSpacing: 1 }}>PREV</Text>
      </TouchableOpacity>

      {/* Step indicator */}
      <View style={{ alignItems: 'center' }}>
        {completed && (
          <Text style={{ fontSize: 12, color: '#22C55E', fontWeight: '800', letterSpacing: 2, marginBottom: 2 }}>✓ DONE</Text>
        )}
        <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '700', letterSpacing: 2 }}>
          {currentStep}/{totalSteps}
        </Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: completed ? '#22C55E' : '#F59E0B',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 50,
          borderBottomWidth: 4,
          borderBottomColor: completed ? '#16A34A' : '#D97706',
        }}
      >
        <Text style={{ fontWeight: '800', color: '#FFFFFF', fontSize: 15, letterSpacing: 1 }}>
          {isLast ? 'FINISH' : 'NEXT'}
        </Text>
        <Text style={{ fontSize: 18, marginLeft: 6, color: '#FFFFFF' }}>▶</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
