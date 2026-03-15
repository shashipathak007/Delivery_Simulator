import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameProvider } from '../context/GameContext';
import { InventoryProvider } from '../context/InventoryContext';
import ErrorBoundary from '../components/ErrorBoundary';
import '../global.css';

export default function Layout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GameProvider>
          <InventoryProvider>
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="step01" />
              <Stack.Screen name="step02" />
              <Stack.Screen name="step03" />
              <Stack.Screen name="step04" />
              <Stack.Screen name="step05" />
              <Stack.Screen name="step06" />
              <Stack.Screen name="step07" />
              <Stack.Screen name="step08" />
              <Stack.Screen name="step09" />
              <Stack.Screen name="step10" />
              <Stack.Screen name="step11" />
              <Stack.Screen name="step12" />
              <Stack.Screen name="step13" />
              <Stack.Screen name="step14" />
              <Stack.Screen name="step15" />
              <Stack.Screen name="step16" />
              <Stack.Screen name="step17" />
              <Stack.Screen name="step18" />
              <Stack.Screen name="complete" />
            </Stack>
          </InventoryProvider>
        </GameProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
