import { proxy } from 'valtio';
import type { Line, Note } from '../types';
import { removeNullish } from '../utils';
import { getEffectiveLine, LineTimeline } from './timelines/line';
import { getEffectiveNote, NoteTimeline } from './timelines/note';

type Store = {
  noteTimelines: { [noteId: string]: NoteTimeline };
  lineTimelines: { [lineId: string]: LineTimeline };
};

export const store: Store = proxy({
  noteTimelines: Object.create(null),
  lineTimelines: Object.create(null)
});

export const getEffectiveNotes = (
  noteTimelinesSnapshot: Readonly<Store['noteTimelines']>
): Map<Note['id'], Note> => {
  const noteTimelinesArray = Object.values(noteTimelinesSnapshot);
  return new Map(
    removeNullish(
      noteTimelinesArray.map(nt => getEffectiveNote(nt))
    ).map(note => [note.id, note])
  );
};

export const getEffectiveLines = (
  lineTimelinesSnapshot: Readonly<Store['lineTimelines']>
): Map<Line['id'], Line> => {
  const lineTimelinesArray = Object.values(lineTimelinesSnapshot);
  return new Map(
    removeNullish(
      lineTimelinesArray.map(lt => getEffectiveLine(lt))
    ).map(line => [line.id, line])
  );
};
