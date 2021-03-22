import { updateNotes as updateNoteStore } from '.';
import { Note, UUID } from '../types';
import * as noteTimeline from './timelines/note';
import {
  patchDeleteNote,
  patchText,
  patchPosition,
  newCommittedNoteTimeline,
  newLocalNoteTimeline,
  setCommitted
} from './timelines/note';

type PatchId = UUID;

export const localAddNote = (note: Note) => {
  return updateNoteStore(noteTimelines => {
    const { timeline, figureId, patchId } = newLocalNoteTimeline(note);
    noteTimelines[figureId] = timeline;
    return patchId;
  });
};

export const localDeleteNote = (id: Note['id']): PatchId | null => {
  return updateNoteStore(noteTimelines => {
    const oldTimeline = noteTimelines[id];
    if (!oldTimeline) {
      return null;
    }
    const { patchId, timeline, figureId } = patchDeleteNote(oldTimeline);
    noteTimelines[figureId] = timeline;
    return patchId;
  });
};

export const localUpdateText = (id: Note['id'], newText: string): PatchId => {
  return updateNoteStore(noteTimelines => {
    const oldTimeline = noteTimelines[id];
    if (!oldTimeline) {
      throw new Error('Tried updating text of a note without a NoteTimeline');
    }
    const { patchId, timeline, figureId } = patchText(oldTimeline, newText);
    noteTimelines[figureId] = timeline;
    return patchId;
  });
};

export const localMoveNote = (id: Note['id'], newX: number, newY: number) => {
  return updateNoteStore(noteTimelines => {
    const nt = noteTimelines[id];
    if (!nt) {
      throw new Error('Tried moving note without NoteTimeline');
    }
    const {patchId, timeline, figureId} = patchPosition(nt, {x: newX, y: newY});
    noteTimelines[figureId] = timeline;
    return patchId;
  });
}

export const setServerState = (id: Note['id'], state: Note | null) => {
  return updateNoteStore(noteTimelines => {
    let nt = noteTimelines[id];
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
    noteTimelines[nt.figureId] = nt;
  });
};

export const discardPatch = (figureId: Note['id'], patchId: PatchId) => {
  return updateNoteStore(noteTimelines => {
    const nt = noteTimelines[figureId];
    if (nt) {
      noteTimelines[figureId] = noteTimeline.discardPatch(nt, patchId);
    }
  });
};
