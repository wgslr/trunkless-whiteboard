import { useSnapshot } from 'valtio';
import { getEffectiveNotes, store } from '.';
import { NoteTimeline } from '../store/timelines/note';
import { Note } from '../types';

export const useEffectivNotes = () => {
  const noteTimelinesSnapshot = useSnapshot(store);
  return getEffectiveNotes(noteTimelinesSnapshot.noteTimelines);
};
