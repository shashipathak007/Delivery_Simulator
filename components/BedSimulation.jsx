import React from 'react';
import { View, Image } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export default function BedSimulation({ 
  hasPlastic = false, 
  hasSheet = false, 
  hasTowel = false, 
  hasMother = false, 
  hasPillow = false,
  extraTowel = false 
}) {
  return (
    <View style={{ width: 260, height: 380, backgroundColor: '#4a3b32', borderRadius: 24, alignItems: 'center', borderWidth: 4, borderColor: '#3e3129', position: 'relative', overflow: 'hidden',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    }}>
      {/* Mattress */}
      <View style={{ position: 'absolute', top: 8, bottom: 8, left: 8, right: 8, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' }} />

      {/* Pillows underneath sheet (Base pillows) */}
      <View style={{ position: 'absolute', top: 16, left: 24, right: 24, height: 48, flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ width: 70, height: 36, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' }} />
        <View style={{ width: 70, height: 36, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' }} />
      </View>

      {/* Layer 1: Plastic Sheet */}
      {hasPlastic && (
        <Animated.View entering={FadeIn.duration(400)} style={{ position: 'absolute', top: 6, bottom: 6, left: 6, right: 6, backgroundColor: 'rgba(147,197,253,0.35)', borderWidth: 2, borderColor: 'rgba(96,165,250,0.4)', borderRadius: 16 }} />
      )}

      {/* Layer 2: Clean Sheet */}
      {hasSheet && (
        <Animated.View entering={FadeIn.duration(400)} style={{ position: 'absolute', top: 40, bottom: 6, left: 6, right: 6, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', borderTopWidth: 3, borderTopColor: '#D1D5DB' }}>
             <View style={{ width: '100%', height: 3, backgroundColor: '#F3F4F6', marginTop: 8 }} />
        </Animated.View>
      )}

      {/* Added Support Pillow (Step 06) */}
      {hasPillow && (
         <Animated.View entering={ZoomIn.springify()} style={{ position: 'absolute', top: 50, left: 30, right: 30, height: 56, backgroundColor: '#EFF6FF', borderRadius: 16, borderWidth: 2, borderColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
           shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
         }}>
             <Image source={require('../assets/images/pillow.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
         </Animated.View>
      )}

      {/* Layer 3: Towels under mother */}
      {(hasTowel || extraTowel) && (
        <Animated.View entering={ZoomIn.springify()} style={{ 
          position: 'absolute', bottom: extraTowel ? 80 : 100, left: 30, right: 30, height: 70, 
          backgroundColor: '#FEF3C7', borderRadius: 8, borderWidth: 2, borderColor: '#FDE68A',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
        }}>
            <Image source={require('../assets/images/towel.png')} style={{ width: 50, height: 50 }} resizeMode="contain" />
        </Animated.View>
      )}

      {/* Mother Layer */}
      {hasMother && (
        <Animated.View entering={FadeIn.duration(600)} style={{ position: 'absolute', top: 30, bottom: 30, left: 10, right: 10, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
           <Image 
              source={require('../assets/images/Pregnent_Mother_In_Bed.jpg')}
              style={{ width: '100%', height: '100%', transform: [{ scale: 1.05 }] }}
              resizeMode="contain"
           />
        </Animated.View>
      )}

    </View>
  );
}
