import { useEffect, useState } from 'react';
import { getCombinedState, CombinedState } from '.';

let listeners: React.Dispatch<React.SetStateAction<CombinedState>>[] = [];

export const useGlobalStore = () => {
  const [state, setState] = useState(getCombinedState());
  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter(l => l !== setState);
    };
  }, []);

  listeners.push(setState);
  return [state];
};

export const sendUpdate = () => {
  const newState = getCombinedState();
  for (const listener of listeners) {
    listener(newState);
  }
};
