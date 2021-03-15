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

export { useGlobalStore } from './hook';

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

export const updateStore = <T>(callback: (store: Store) => T): T => {
  /** Callback should mutate the store.
   * By exporting this function, and not the store variable directly,
   * we discourage mutating it without triggering the react update.
   */
  const result = callback(store);
  sendUpdate();
  return result;
};
