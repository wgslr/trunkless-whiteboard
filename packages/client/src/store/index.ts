import type { Note } from '../types';
import { removeNullish } from '../utils';
import { sendUpdate } from './hook';
import { getNewestLocalState, NoteTimeline } from './timelines/note';

type Store = {
  noteTimelines: Map<Note['id'], NoteTimeline>;
};
let store: Store = {
  noteTimelines: new Map()
};

export type CombinedState = {
  notes: Map<Note['id'], Note>;
};

export const getCombinedState = (): CombinedState => {
  const noteTimelinesArray = Array.from(store.noteTimelines.values());
  return {
    notes: new Map(
      removeNullish(
        noteTimelinesArray.map(nt => getNewestLocalState(nt))
      ).map(note => [note.id, note])
    )
  };
};

export const updateStore = (callback: (store: Store) => void): void => {
  /** Callback should mutate the store */
  callback(store);
  sendUpdate();
};
