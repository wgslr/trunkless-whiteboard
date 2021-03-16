import { proxy, subscribe } from 'valtio';
import type { Note } from '../types';
import { removeNullish } from '../utils';
import { getNewestLocalState, NoteTimeline } from './timelines/note';

type Store = {
  noteTimelines: { [noteId: string]: NoteTimeline };
};

export const store: Store = proxy({ noteTimelines: Object.create(null) });

export const getEffectiveNotes = (
  noteTimelinesSnapshot: Readonly<Store['noteTimelines']>
): Map<Note['id'], Note> => {
  const noteTimelinesArray = Object.values(store.noteTimelines);
  return new Map(
    removeNullish(
      noteTimelinesArray.map(nt => getNewestLocalState(nt))
    ).map(note => [note.id, note])
  );
};
