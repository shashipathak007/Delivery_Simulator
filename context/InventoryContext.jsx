import React, { createContext, useContext, useState } from 'react';

// Define the steps that require an item.
const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [usedItems, setUsedItems] = useState({});
  const [collectedItems, setCollectedItems] = useState([]);

  // e.g. usedItems['step03'] = ['soap', 'basin']
  const markItemUsed = (stepId, itemId) => {
    setUsedItems((prev) => {
      const stepItems = prev[stepId] || [];
      return {
        ...prev,
        [stepId]: [...stepItems, itemId]
      };
    });
  };

  const hasItemBeenUsed = (stepId, itemId) => {
    const stepItems = usedItems[stepId] || [];
    return stepItems.includes(itemId);
  };

  const markItemCollected = (itemId) => {
    setCollectedItems((prev) => [...prev, itemId]);
  };

  const hasCollected = (itemId) => {
    return collectedItems.includes(itemId);
  };

  const resetInventory = () => {
    setUsedItems({});
    setCollectedItems([]);
  };

  return (
    <InventoryContext.Provider value={{
      usedItems, markItemUsed, hasItemBeenUsed,
      collectedItems, markItemCollected, hasCollected,
      resetInventory
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
