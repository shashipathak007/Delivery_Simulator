import React, { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [score, setScore] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const addScore = useCallback((points) => {
    setScore((prev) => prev + points);
  }, []);

  const markStepComplete = useCallback((stepNum) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(stepNum);
      return next;
    });
  }, []);

  const isStepComplete = useCallback((stepNum) => {
    return completedSteps.has(stepNum);
  }, [completedSteps]);

  const resetGame = useCallback(() => {
    setScore(0);
    setCompletedSteps(new Set());
  }, []);

  return (
    <GameContext.Provider value={{ score, addScore, resetGame, markStepComplete, isStepComplete, completedSteps }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
