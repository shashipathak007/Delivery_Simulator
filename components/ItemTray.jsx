import React from 'react';
import { View, StyleSheet } from 'react-native';
import DraggableItem from './DraggableItem';
import Animated, { SlideInDown } from 'react-native-reanimated';

export default function ItemTray({ items, usedItems = [], lockedItems = [], onDrop, onProximity }) {
  return (
    <Animated.View 
      entering={SlideInDown.duration(600).springify()}
      className="bg-white rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pt-6 pb-6 px-4 flex-row flex-wrap justify-center absolute w-full"
      style={{ elevation: 15, zIndex: 100, bottom: 120 }}
    >
      <View className="w-12 h-1 bg-gray-200 rounded-full absolute top-2 left-1/2 -translate-x-6" />
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
