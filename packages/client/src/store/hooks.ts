import { useEffect, useState } from 'react';
import { getEffectiveLines, getEffectiveNotes } from '.';

let noteListeners: React.Dispatch<
  React.SetStateAction<ReturnType<typeof getEffectiveNotes>>
>[] = [];
let lineListeners: React.Dispatch<
  React.SetStateAction<ReturnType<typeof getEffectiveLines>>
>[] = [];

export const useEffectiveNotes = () => {
  const [state, setState] = useState(getEffectiveNotes());
  useEffect(() => {
    noteListeners.push(setState);
    return () => {
      noteListeners = noteListeners.filter(l => l !== setState);
    };
  }, []);

  return state;
};

export const useEffectiveLines = () => {
  const [state, setState] = useState(getEffectiveLines());
  useEffect(() => {
    lineListeners.push(setState);
    return () => {
      lineListeners = lineListeners.filter(l => l !== setState);
    };
  }, []);

  return state;
};

export const sendNotesUpdate = () => {
  const newState = getEffectiveNotes();
  for (const listener of noteListeners) {
    listener(newState);
  }
};

export const sendLinesUpdate = () => {
  const newState = getEffectiveLines();
  for (const listener of lineListeners) {
    listener(newState);
  }
};
