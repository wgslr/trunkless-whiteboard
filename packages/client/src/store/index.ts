import type { Line, Note, Img } from '../types';
import { removeNullish } from '../utils';
import { sendLinesUpdate, sendNotesUpdate, sendImgsUpdate } from './hooks';
import { getEffectiveLine, LineTimeline } from './timelines/line';
import { getEffectiveNote, NoteTimeline } from './timelines/note';
import { getEffectiveImg, ImgTimeline } from './timelines/image';

const noteTimelines: { [noteId: string]: NoteTimeline } = Object.create(null);
const lineTimelines: { [lineId: string]: LineTimeline } = Object.create(null);
const imgTimelines: { [imgId: string]: ImgTimeline } = Object.create(null);

export const updateImages = <T>(
  callback: (nTimelines: typeof imgTimelines) => T
): T => {
  const result = callback(imgTimelines);
  effectiveImgsCache = null;
  sendImgsUpdate();
  return result;
};

let effectiveImgsCache: Map<Img['id'], Img> | null = null;
const calculateEffectiveImgs = (): void => {
  const imgTimelinesArray = Object.values(imgTimelines);
  effectiveImgsCache = new Map(
    removeNullish(
      imgTimelinesArray.map(it => getEffectiveImg(it))
    ).map(img => [img.id, img])
  );
};

export const getEffectiveImgs = (): Map<Img['id'], Img> => {
  if (effectiveImgsCache === null) {
    calculateEffectiveImgs();
  }
  return effectiveImgsCache!;
};


const clearObj = (o: any): void => {
  for (const key of Object.keys(o)) {
    delete o[key];
  }
};
export const clearStores = () => {
  updateNotes(clearObj);
  updateLineStore(clearObj);
};

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
