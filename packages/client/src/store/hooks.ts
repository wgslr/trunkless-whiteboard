import { useSnapshot } from 'valtio';
import { getEffectiveLines, getEffectiveNotes, store } from '.';

export const useEffectiveNotes = () => {
  const storeSnapshot = useSnapshot(store);
  return getEffectiveNotes(storeSnapshot.noteTimelines);
};

export const useEffectiveLines = () => {
  const storeSnapshot = useSnapshot(store, { sync: true });
  return getEffectiveLines(storeSnapshot.lineTimelines);
};
