import { v4 } from 'uuid';
import { updateStore } from '.';
import { createNoteMessage } from '../connection/messages';
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
    const nt = store.noteTimelines.get(id);
    if (!nt) {
      console.error('tried deleting a note without NoteTimeline');
      return;
    } else {
      store.noteTimelines.set(nt.figureId, modifyDelete(nt));
      console.log('added note removal operation', { nt });
    }
  });
};

export const localUpdateText = (id: Note['id'], newText: string) => {
  const patchId = updateStore(store => {
    const nt = store.noteTimelines.get(id);
    if (nt) {
      const [newNT, patchId] = modifyText(nt, newText);
      store.noteTimelines.set(nt.figureId, newNT);
      return patchId;
    } else {
      throw new Error('Tried updating text of a note without NoteTimeline');
    }
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
