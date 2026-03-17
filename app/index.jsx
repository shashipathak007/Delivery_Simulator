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
  Easing,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const pulseScale = useSharedValue(1);
  const logoY = useSharedValue(0);

  useEffect(() => {
    // Pulse animation for the button
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Floating animation for the logo
    logoY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const buttonPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const logoFloat = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
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
        <LinearGradient 
          colors={['rgba(10,22,40,0.85)', 'rgba(10,22,40,0.4)', 'rgba(10,22,40,0.85)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 40 }}>
          
          {/* TOP — Logo & Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(1000)} style={{ alignItems: 'center' }}>
            <Animated.View style={[logoFloat]}>
              <View style={{ 
                width: 140, height: 140, borderRadius: 80, 
                overflow: 'hidden',
                borderWidth: 6, borderColor: '#F33A6A',
                shadowColor: '#F33A6A', shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.6, shadowRadius: 20, elevation: 20,
                marginBottom: 25,
                backgroundColor: '#FFF'
              }}>
                <Image 
                  source={require('../assets/images/logo.png')} 
                  style={{ width: 140, height: 140 }} 
                  resizeMode="contain" 
                />
              </View>
            </Animated.View>
            
            <Text style={{ 
              fontSize: 48, fontWeight: '900', color: '#FFF' , 
              letterSpacing: -1,
            }}>
              Baby<Text style={{ color: '#F33A6A' }}>Guide</Text>
            </Text>
            <View style={{ height: 2, width: 80, backgroundColor: '#F33A6A', marginTop: 8, borderRadius: 1 }} />
            <Text style={{ 
              fontSize: 14, fontWeight: '800', color: '#FFFFFF', 
              letterSpacing: 6, textTransform: 'uppercase', marginTop: 12,
              opacity: 0.9
            }}>
              Home Birth Simulator
            </Text>
          </Animated.View>

          {/* MIDDLE — Key Features */}
          <Animated.View entering={FadeInDown.delay(600).duration(800)} style={{ paddingHorizontal: 32 }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 30, padding: 25,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <Text style={{ 
                fontSize: 13, fontWeight: '900', color: '#FFF', 
                textAlign: 'center', letterSpacing: 4, textTransform: 'uppercase',
                marginBottom: 20, opacity: 0.6
              }}>
                Emergency Training
              </Text>
              
              <View style={{ gap: 14 }}>
               {[
                  { label: 'Step-by-Step Guidance', icon: 'check-circle', color: '#4ADE80' },
                  { label: 'Realistic Interactions', icon: 'gesture-tap-button', color: '#60A5FA' },
                  { label: 'Emergency Best Practices', icon: 'alert-decagram', color: '#FBBF24' },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                       <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                    </View>
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* BOTTOM — Action Button */}
          <Animated.View entering={FadeInUp.delay(1000).duration(1000)} style={{ paddingHorizontal: 32 }}>
            <Animated.View style={[buttonPulse]}>
              <TouchableOpacity 
                onPress={() => router.push('/step01')}
                activeOpacity={0.9}
                style={{
                  backgroundColor: '#F33A6A',
                  borderRadius: 24,
                  paddingVertical: 22,
                  alignItems: 'center',
                  shadowColor: '#F33A6A',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 15,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 2 }}>
                  START SIMULATION
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 4, opacity: 0.8 }}>
                  BE PREPARED. SAVE LIVES.
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ alignItems: 'center', marginTop: 25 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>
                Education for Emergencies
              </Text>
            </View>
          </Animated.View>

        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
