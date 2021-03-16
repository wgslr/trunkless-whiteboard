import { proxy } from 'valtio';
import type { Note } from '../types';
import { removeNullish } from '../utils';
import { getNewestLocalState, NoteTimeline } from './timelines/note';

type Store = {
  noteTimelines: Map<Note['id'], NoteTimeline>;
};

export const noteTimelinesState: Map<Note['id'], NoteTimeline> = proxy(
  new Map()
);

export const getEffectiveNotes = (
  noteTimelinesSnapshot: Readonly<typeof noteTimelinesState>
): Map<Note['id'], Note> => {
  const noteTimelinesArray = Array.from(noteTimelinesSnapshot.values());
  return new Map(
    removeNullish(
      noteTimelinesArray.map(nt => getNewestLocalState(nt))
    ).map(note => [note.id, note])
  );
};

export const updateStore = <T>(callback: (store: Store) => T): T => {
  // Legacy function from before valtio introduction
  const result = callback({ noteTimelines: noteTimelinesState });
  return result;
};
