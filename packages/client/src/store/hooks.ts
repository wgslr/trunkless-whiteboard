import React, { useEffect, useState } from 'react';
import { getEffectiveLines, getEffectiveNotes, getEffectiveImgs } from '.';
import lodash from 'lodash';

let noteListeners: React.Dispatch<
  React.SetStateAction<ReturnType<typeof getEffectiveNotes>>
>[] = [];
let lineListeners: React.Dispatch<
  React.SetStateAction<ReturnType<typeof getEffectiveLines>>
>[] = [];
let imgListeners: React.Dispatch<
  React.SetStateAction<ReturnType<typeof getEffectiveImgs>>
>[] = [];

const STATE_UPDATE_FREQUENCY_MS = 5;

export const useEffectiveNotes = () => {
  const [state, setState] = useState(getEffectiveNotes);
  useEffect(() => {
    noteListeners.push(setState);
    return () => {
      noteListeners = noteListeners.filter(l => l !== setState);
    };
  }, []);

  return state;
};

export const useEffectiveLines = () => {
  const [state, setState] = useState(getEffectiveLines);
  useEffect(() => {
    lineListeners.push(setState);
    return () => {
      lineListeners = lineListeners.filter(l => l !== setState);
    };
  }, []);

  return state;
};

export const useEffectiveImages = () => {
  const [state, setState] = useState(getEffectiveImgs);
  useEffect(() => {
    imgListeners.push(setState);
    return () => {
      imgListeners = imgListeners.filter(l => l !== setState);
    };
  }, []);
  return state;
};

export const sendNotesUpdate = lodash.throttle(
  () => {
    const newState = getEffectiveNotes();
    for (const listener of noteListeners) {
      listener(newState);
    }
  },
  STATE_UPDATE_FREQUENCY_MS,
  { leading: true, trailing: true }
);

export const sendLinesUpdate = lodash.throttle(
  () => {
    const newState = getEffectiveLines();
    for (const listener of lineListeners) {
      listener(newState);
    }
  },
  STATE_UPDATE_FREQUENCY_MS,
  { leading: true, trailing: true }
);

export const sendImgsUpdate = lodash.throttle(
  () => {
    const newState = getEffectiveImgs();
    for (const listener of imgListeners) {
      listener(newState);
    }
  },
  STATE_UPDATE_FREQUENCY_MS,
  { leading: true, trailing: true }
);
