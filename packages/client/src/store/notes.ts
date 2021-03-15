import { v4 } from 'uuid';
import { updateStore } from '.';
import { makeCreateNoteMessage } from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import { Coordinates, Note, UUID } from '../types';
import {
  modifyDelete,
  modifyText,
  newCommittedNoteTimeline,
  newLocalNoteTimeline,
  setCommitted
} from './timelines/note';
import * as noteTimeline from './timelines/note';

// TODO change name, if we are doing server push in this function
export const localAddNote = (note: Note) => {
  const { timeline, figureId, patchId } = newLocalNoteTimeline(note);
  updateStore(store => {
    store.noteTimelines.set(figureId, timeline);
  });
  return patchId;
};

export const localDeleteNote = (id: Note['id']) => {
  updateStore(store => {
    const oldTimeline = store.noteTimelines.get(id);
    if (!oldTimeline) {
      console.error('tried deleting a note without NoteTimeline');
      return;
    } else {
      store.noteTimelines.set(oldTimeline.figureId, modifyDelete(oldTimeline));
      console.log('added note removal operation', { nt: oldTimeline });
    }
  });
};

export const localUpdateText = (id: Note['id'], newText: string): UUID => {
  return updateStore(store => {
    const oldTimeline = store.noteTimelines.get(id);
    if (!oldTimeline) {
      throw new Error('Tried updating text of a note without a NoteTimeline');
    }
    const { patchId, timeline, figureId } = modifyText(oldTimeline, newText);
    store.noteTimelines.set(figureId, timeline);
    return patchId;
  });
};

export const setServerState = (id: Note['id'], state: Note | null) => {
  updateStore(store => {
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
  });
};

export const discardPatch = (figureId: Note['id'], patchId: UUID) => {
  updateStore(store => {
    let nt = store.noteTimelines.get(figureId);
    if (nt) {
      store.noteTimelines.set(figureId, noteTimeline.discardPatch(nt, patchId));
    }
  });
};
