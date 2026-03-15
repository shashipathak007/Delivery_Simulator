import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, ZoomIn, SlideOutDown } from 'react-native-reanimated';

export default function SuccessOverlay({ message, points = 100, onComplete }) {
  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View 
      entering={FadeIn.duration(300)} 
      exiting={SlideOutDown.duration(400)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
    >
      <Animated.View 
        entering={ZoomIn.springify().damping(12)}
        style={{
          backgroundColor: '#FFF',
          borderRadius: 24,
          padding: 32,
          alignItems: 'center',
          borderWidth: 4,
          borderColor: '#4ADE80',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 10,
          marginHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✨</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#22C55E', marginBottom: 8 }}>Great Job!</Text>
        <Text style={{ fontSize: 18, color: '#4B5563', textAlign: 'center', marginBottom: 24 }}>{message}</Text>
        
        <View style={{ backgroundColor: '#FEF9C3', borderRadius: 50, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>⭐</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#CA8A04' }}>+{points} Points</Text>
        </View>

        <Text style={{ fontSize: 12, color: '#22C55E', fontWeight: '700', letterSpacing: 2 }}>TAP NEXT TO CONTINUE ▶</Text>
      </Animated.View>
    </Animated.View>
  );
}
