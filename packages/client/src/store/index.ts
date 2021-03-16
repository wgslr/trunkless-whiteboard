import { proxy, subscribe } from 'valtio';
import type { Note } from '../types';
import { removeNullish } from '../utils';
import { getNewestLocalState, NoteTimeline } from './timelines/note';

type Store = {
  noteTimelines: Map<Note['id'], NoteTimeline>;
};

export const store: Store = proxy({ noteTimelines: new Map() });

subscribe(store, () => console.log('Store changed', { store }));

export const getEffectiveNotes = (
  noteTimelinesSnapshot: Readonly<Store['noteTimelines']>
): Map<Note['id'], Note> => {
  const noteTimelinesArray = Array.from(noteTimelinesSnapshot.values());
  return new Map(
    removeNullish(
      noteTimelinesArray.map(nt => getNewestLocalState(nt))
    ).map(note => [note.id, note])
  );
};
