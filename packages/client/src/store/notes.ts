import { store } from '.';
import { Note, UUID } from '../types';
import * as noteTimeline from './timelines/note';
import {
  modifyDelete,
  modifyText,
  newCommittedNoteTimeline,
  newLocalNoteTimeline,
  setCommitted
} from './timelines/note';

type PatchId = UUID;

// TODO change name, if we are doing server push in this function
export const localAddNote = (note: Note) => {
  const { timeline, figureId, patchId } = newLocalNoteTimeline(note);
  store.noteTimelines.set(figureId, timeline);
  return patchId;
};

export const localDeleteNote = (id: Note['id']): PatchId | null => {
  const oldTimeline = store.noteTimelines.get(id);
  if (!oldTimeline) {
    return null;
  }
  const { patchId, timeline, figureId } = modifyDelete(oldTimeline);
  store.noteTimelines.set(figureId, timeline);
  return patchId;
};

export const localUpdateText = (id: Note['id'], newText: string): PatchId => {
  const oldTimeline = store.noteTimelines.get(id);
  if (!oldTimeline) {
    throw new Error('Tried updating text of a note without a NoteTimeline');
  }
  const { patchId, timeline, figureId } = modifyText(oldTimeline, newText);
  store.noteTimelines.set(figureId, timeline);
  return patchId;
};

export const setServerState = (id: Note['id'], state: Note | null) => {
  let nt = store.noteTimelines.get(id);
  if (!nt) {
    if (state === null) {
      // if have nothing to delete
      return;
    } else {
      nt = newCommittedNoteTimeline(state);
    }
  } else {
    nt = setCommitted(nt, state);
  }
  store.noteTimelines.set(nt.figureId, nt);
};

export const discardPatch = (figureId: Note['id'], patchId: PatchId) => {
  let nt = store.noteTimelines.get(figureId);
  if (nt) {
    store.noteTimelines.set(figureId, noteTimeline.discardPatch(nt, patchId));
  }
};
