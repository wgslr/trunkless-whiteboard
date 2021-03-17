import type { Line, Note } from '../types';
import { removeNullish } from '../utils';
import { sendLinesUpdate, sendNotesUpdate } from './hooks';
import { getEffectiveLine, LineTimeline } from './timelines/line';
import { getEffectiveNote, NoteTimeline } from './timelines/note';

const noteTimelines: { [noteId: string]: NoteTimeline } = Object.create(null);
const lineTimelines: { [lineId: string]: LineTimeline } = Object.create(null);

export const updateNotes = <T>(
  callback: (nTimelines: typeof noteTimelines) => T
): T => {
  // Legacy function from before valtio introduction
  const result = callback(noteTimelines);
  sendNotesUpdate();
  return result;
};

export const updateLineStore = <T>(
  callback: (lTimelines: typeof lineTimelines) => T
): T => {
  // Legacy function from before valtio introduction
  const result = callback(lineTimelines);
  sendLinesUpdate();
  return result;
};

export const getEffectiveNotes = (): Map<Note['id'], Note> => {
  const noteTimelinesArray = Object.values(noteTimelines);
  return new Map(
    removeNullish(
      noteTimelinesArray.map(nt => getEffectiveNote(nt))
    ).map(note => [note.id, note])
  );
};

export const getEffectiveLines = (): Map<Line['id'], Line> => {
  const lineTimelinesArray = Object.values(lineTimelines);
  return new Map(
    removeNullish(
      lineTimelinesArray.map(lt => getEffectiveLine(lt))
    ).map(line => [line.id, line])
  );
};
