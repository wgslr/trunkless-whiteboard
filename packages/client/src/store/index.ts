import type { Note } from '../types';
import { removeNullish } from '../utils';
import { getNewestLocalState, NoteTimeline } from './note';

const noteTimelines: Map<Note['id'], NoteTimeline> = new Map();

export type CombinedState = {
  notes: Map<Note['id'], Note>;
};

export const getCombinedState = (): CombinedState => {
  const noteTimelinesArray = Array.from(noteTimelines.values());
  return {
    notes: new Map(
      removeNullish(
        noteTimelinesArray.map(nt => getNewestLocalState(nt))
      ).map(note => [note.id, note])
    )
  };
};
