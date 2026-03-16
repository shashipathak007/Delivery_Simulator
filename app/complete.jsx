import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, FadeInDown, ZoomIn, 
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useGame } from '../context/GameContext';
import Confetti from '../components/Confetti';

const { width, height } = Dimensions.get('window');

export default function Complete() {
  const router = useRouter();
  const { score, completedSteps, resetGame } = useGame();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  const handleRestart = () => {
    resetGame();
    router.replace('/');
  };

  const getScoreMessage = () => {
    if (score >= 1000) return "Expert Midwife! 🌟";
    if (score >= 800) return "Great Job! 🎉";
    return "Simulation completed! 👍";
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1628' }}>
      <StatusBar barStyle="light-content" />

      {/* Blurred background scene */}
      <ImageBackground source={require('../assets/images/Starting_Page.png')} style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} blurRadius={15} />

      {/* Dark overlay */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', zIndex: 2, backgroundColor: 'rgba(10,22,40,0.75)' }} />

      <SafeAreaView style={{ flex: 1, zIndex: 3, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        
        <Animated.View entering={ZoomIn.duration(800)} style={{ alignItems: 'center', width: '100%' }}>
          
          <Animated.View style={badgeStyle}>
            <View style={{ 
              width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFFFFF',
              borderWidth: 6, borderColor: '#10B981', 
              shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 15,
              alignItems: 'center', justifyContent: 'center', marginBottom: 30, overflow: 'hidden'
            }}>
              <Image source={require('../assets/images/logo.png')} style={{ width: 140, height: 140 }} resizeMode="cover" />
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(300).duration(600)} 
            style={{ color: '#10B981', fontSize: 24, fontWeight: '900', letterSpacing: 4, textAlign: 'center', textTransform: 'uppercase', marginBottom: 10 }}>
            EMERGENCY OVER
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(500).duration(600)} 
            style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 4 }}>
            {getScoreMessage()}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(700).duration(600)} 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 30, width: '100%', marginTop: 20, 
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' 
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 15, marginBottom: 15 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>FINAL SCORE</Text>
              <Text style={{ color: '#F59E0B', fontSize: 22, fontWeight: '900' }}>🏆 {score}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>STEPS COMPLETE</Text>
              <Text style={{ color: '#60A5FA', fontSize: 22, fontWeight: '900' }}>{completedSteps.size} / 17</Text>
            </View>
          </Animated.View>

        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={{ width: '100%', marginTop: 40 }}>
          <TouchableOpacity onPress={handleRestart} activeOpacity={0.8}
            style={{ backgroundColor: '#2563EB', borderRadius: 20, paddingVertical: 20, alignItems: 'center', borderBottomWidth: 5, borderBottomColor: '#1D4ED8', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
      <Confetti count={50} />
    </View>
  );
}
