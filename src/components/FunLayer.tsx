import React from 'react';
import BrainAssistant from './BrainAssistant';
import BrainPowerMeter from './BrainPowerMeter';
import { useFun } from '@/context/FunContext';

/**
 * FunLayer - mounted once in App.tsx
 * Renders all fun overlay components that work across the site.
 * None of these interfere with game logic.
 */
const FunLayer = () => {
  const { funMode } = useFun();
  if (!funMode) return null;

  return (
    <>
      <BrainAssistant />
      <BrainPowerMeter />
    </>
  );
};

export default FunLayer;
