import React from 'react';
import { View, StyleSheet } from 'react-native';
import DraggableItem from './DraggableItem';
import Animated, { SlideInDown, SlideInUp } from 'react-native-reanimated';

export default function ItemTray({ items, usedItems = [], lockedItems = [], onDrop, onProximity, position = 'bottom' }) {
  const isTop = position === 'top';
  return (
    <Animated.View 
      entering={isTop ? SlideInUp.duration(600).springify() : SlideInDown.duration(600).springify()}
      className={`shadow-[0_4px_15px_-3px_rgba(0,0,0,0.5)] flex-row flex-wrap justify-center absolute w-full ${isTop ? 'rounded-b-3xl pt-14 pb-4 px-2' : 'rounded-t-3xl pt-6 pb-6 px-4'}`}
      style={{ 
        elevation: 15, 
        zIndex: 100, 
        top: isTop ? 0 : undefined,
        bottom: isTop ? undefined : 120,
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      }}
    >
      <View className={`w-12 h-1 bg-gray-500 rounded-full absolute left-1/2 -translate-x-6 ${isTop ? 'bottom-2' : 'top-2'}`} />
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          isUsed={usedItems.includes(item.id)}
          isLocked={lockedItems.includes(item.id)}
          onDrop={onDrop}
          onProximity={onProximity}
        />
      ))}
    </Animated.View>
  );
}
