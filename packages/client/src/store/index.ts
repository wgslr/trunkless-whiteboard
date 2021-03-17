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
  const result = callback(noteTimelines);
  effectiveNotesCache = null;
  sendNotesUpdate();
  return result;
};

export const updateLineStore = <T>(
  callback: (lTimelines: typeof lineTimelines) => T
): T => {
  const result = callback(lineTimelines);
  effectiveLinesCache = null;
  sendLinesUpdate();
  return result;
};

let effectiveNotesCache: Map<Note['id'], Note> | null = null;
const calculateEffectiveNotes = (): void => {
  const noteTimelinesArray = Object.values(noteTimelines);
  effectiveNotesCache = new Map(
    removeNullish(
      noteTimelinesArray.map(nt => getEffectiveNote(nt))
    ).map(note => [note.id, note])
  );
};

export const getEffectiveNotes = (): Map<Note['id'], Note> => {
  if (effectiveNotesCache === null) {
    calculateEffectiveNotes();
  }
  return effectiveNotesCache!;
};

let effectiveLinesCache: Map<Line['id'], Line> | null = null;
const calculateEffectiveLines = (): void => {
  const lineTimelinesArray = Object.values(lineTimelines);
  effectiveLinesCache = new Map(
    removeNullish(
      lineTimelinesArray.map(lt => getEffectiveLine(lt))
    ).map(line => [line.id, line])
  );
};

export const getEffectiveLines = (): Map<Line['id'], Line> => {
  if (effectiveLinesCache === null) {
    calculateEffectiveLines();
  }
  return effectiveLinesCache!;
};
