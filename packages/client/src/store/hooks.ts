import { useSnapshot } from 'valtio';
import { getEffectiveNotes, store } from '.';

export const useEffectiveNotes = () => {
  const noteTimelinesSnapshot = useSnapshot(store);
  return getEffectiveNotes(noteTimelinesSnapshot.noteTimelines);
};
