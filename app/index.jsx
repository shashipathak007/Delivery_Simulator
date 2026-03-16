import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const buttonPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1628' }}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ImageBackground
        source={require('../assets/images/Starting_Page.png')}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        {/* Uniform dark overlay */}
        <View style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10,22,40,0.6)',
        }} />

        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          
          {/* TOP — Logo & Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={{ alignItems: 'center', paddingTop: 30 }}>
            {/* Round Logo */}
            <View style={{ 
              width: 110, height: 110, borderRadius: 55, 
              overflow: 'hidden',
              borderWidth: 4, borderColor: '#F33A6A',
              shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4, shadowRadius: 12, elevation: 15,
              marginBottom: 20,
            }}>
              <Image 
                source={require('../assets/images/logo.png')} 
                style={{ width: 110, height: 110 }} 
                resizeMode="cover" 
              />
            </View>
            
            <Text style={{ 
              fontSize: 36, fontWeight: '900', color: '#F33A6A' , 
              letterSpacing: -0.5,
            }}>
              BabyGuide
            </Text>
            <Text style={{ 
              fontSize: 13, fontWeight: '800', color: '#FFFFFF', 
              letterSpacing: 5, textTransform: 'uppercase', marginTop: 6,
            }}>
              Home Birth Simulator
            </Text>
          </Animated.View>

          {/* MIDDLE — Info Card */}
          <Animated.View entering={FadeInDown.delay(500).duration(800)} style={{ paddingHorizontal: 28 }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderRadius: 24, padding: 22,
              borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
            }}>
              <Text style={{ 
                fontSize: 12, fontWeight: '900', color: '#FFFFFF', 
                textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase',
                marginBottom: 16, opacity: 0.8,
              }}>
                At-Home Delivery Training
              </Text>
              
              {[
                { label: '17 Interactive Steps', dot: '#4ADE80' },
                { label: 'Sterile Tool Handling', dot: '#60A5FA' },
                { label: 'Mother & Baby Care', dot: '#F472B6' },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < 2 ? 10 : 0 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.dot, marginRight: 14 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* BOTTOM — Blue Button */}
          <Animated.View entering={FadeInUp.delay(800).duration(800)} style={{ alignItems: 'center', paddingBottom: 30, paddingHorizontal: 28 }}>
            <Animated.View style={[buttonPulse, { width: '100%' }]}>
              <TouchableOpacity 
                onPress={() => router.push('/step01')}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#F33A6A',
                  borderRadius: 20,
                  paddingVertical: 20,
                  alignItems: 'center',
                  
                  shadowColor: '#2563EB',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>
                  Start Home Birth
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginTop: 4, opacity: 0.7 }}>
                  HOME DELIVERY SIMULATION
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 16, textTransform: 'uppercase', opacity: 0.4 }}>
              In Emergency Situation
            </Text>
          </Animated.View>

        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
