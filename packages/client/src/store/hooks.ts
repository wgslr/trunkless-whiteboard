import { useState, useEffect } from 'react';
import { useSnapshot, subscribe } from 'valtio';
import { getEffectiveLines, getEffectiveNotes, store } from '.';

export const useEffectiveNotes = () => {
  const storeSnapshot = useSnapshot(store);
  return getEffectiveNotes(storeSnapshot.noteTimelines);
};

export const useEffectiveLines = () => {
  const [effectiveLines, setEffectiveLines] = useState<
    ReturnType<typeof getEffectiveLines>
  >(new Map());
  // Use the mutable store to compue effective lines.
  // Skipping snapshot generation greatly improves performance
  useEffect(
    () =>
      subscribe(store.lineTimelines, () => {
        setEffectiveLines(getEffectiveLines(store.lineTimelines));
      }),
    [store.lineTimelines]
  );
  return effectiveLines;
};
