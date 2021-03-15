import { useEffect, useState } from 'react';
import { getCombinedState, CombinedState } from '.';

let listeners: React.Dispatch<React.SetStateAction<CombinedState>>[] = [];

export const useGlobalStore = () => {
  const [state, setState] = useState(getCombinedState());
  useEffect(() => {
    listeners.push(setState);

    const cleanup = () => {
      listeners = listeners.filter(l => l !== setState);
    };
    return cleanup;
  }, []);

  return [state];
};

export const sendUpdate = () => {
  const newState = getCombinedState();
  for (const listener of listeners) {
    listener(newState);
  }
};
