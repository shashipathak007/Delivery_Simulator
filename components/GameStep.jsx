import React, { useEffect } from 'react';
import { View, ImageBackground, StatusBar, Text } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate,
  ZoomIn,
  BounceIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import StepHeader from './StepHeader';
import Confetti from './Confetti';

/**
 * Reusable wrapper for all game steps.
 * Provides consistent: background handling, gradient overlays, header (with nav), and confetti.
 * Added: Subtle auto-zooming (Ken Burns effect) for premium feel.
 */
export default function GameStep({
  step,
  score,
  scenes,             // Array of { id, image }
  sceneIndex,         // Current scene index
  isDone = false,     // Whether step is complete
  showConfetti = false,
  statusTitle = "WELL DONE",
  statusDetail = "STEP COMPLETE",
  backgroundColor = '#0A1628',
  children,           // Main content (center + bottom)
  topContent = null,  // Optional top content (like ItemTray)
}) {
  const zoomShared = useSharedValue(0);

  useEffect(() => {
    // Subtle Ken Burns effect: Zoom from 1.0 to 1.1 every 15 seconds
    zoomShared.value = withRepeat(
      withTiming(1, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const scale = interpolate(zoomShared.value, [0, 1], [1, 1.04]);
    return {
      transform: [{ scale }]
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen stacked backgrounds with motion */}
      {scenes && scenes.map((s, i) => (
        i === sceneIndex && (
          <Animated.View
            key={s.id}
            entering={FadeIn.duration(800)}
            exiting={FadeOut.duration(800)}
            style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }, animatedBackgroundStyle]}
          >
            <ImageBackground
              source={s.image}
              style={{ flex: 1, width: '100%', height: '100%' }}
              resizeMode={s.resizeMode || 'cover'}
            />
          </Animated.View>
        )
      ))}

      {/* Gradient overlays for readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.88)', 'rgba(0,0,0,0.4)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, zIndex: 2 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, zIndex: 2 }}
        pointerEvents="none"
      />

      {/* Main content area */}
      <View style={{ flex: 1, zIndex: 3, justifyContent: 'space-between' }} pointerEvents="box-none">
        {/* Header with navigation, score, tips — all at the top */}
        <View pointerEvents="auto" style={{ zIndex: 10 }}>
          <StepHeader step={step} score={score} />
        </View>

        {/* Optional top content (item trays, etc) positioned after header but before children */}
        {topContent}

        {/* Children (center area + bottom panel) */}
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom:300  }} pointerEvents="none">
          {isDone && (
            <Animated.View entering={BounceIn.delay(200)} style={{ 
              backgroundColor: 'rgba(16,185,129,0.95)', 
              paddingHorizontal: 40, paddingVertical: 24, 
              borderRadius: 32, 
              borderWidth: 2, borderColor: '#A7F3D0',
              shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 20,
              alignItems: 'center',
            }}>
              <Text style={{ color: '#A7F3D0', fontWeight: '800', fontSize: 13, letterSpacing: 4, marginBottom: 6 }}>{statusTitle}</Text>
              <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 26, letterSpacing: 1 }}>{statusDetail}</Text>
            </Animated.View>
          )}
        </View>

        {children}
      </View>

      {/* Confetti effect */}
      {showConfetti && <Confetti count={50} />}
    </View>
  );
}
