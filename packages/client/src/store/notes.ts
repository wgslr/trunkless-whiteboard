import { v4 } from 'uuid';
import { updateStore } from '.';
import { serverConnection } from '../connection-context/server-connection';
import { Coordinates, Note } from '../types';
import {
  newLocalNoteTimeline,
  modifyDelete,
  modifyText,
  setCommitted,
  newCommittedNoteTimeline
} from './timelines/note';

export const localAddNote = (pos: Coordinates) => {
  const nt = newLocalNoteTimeline({
    id: v4(),
    position: pos,
    text: 'a new note'
  });
  updateStore(store => {
    store.noteTimelines.set(nt.noteId, nt);
  });

  // FIXME very dirty
  serverConnection.connection.publishNote({
    ...(nt.patches[nt.patches.length - 1].diff as Omit<Note, 'id'>),
    id: nt.noteId
  });
};

export const localDeleteNote = (id: Note['id']) => {
  updateStore(store => {
    const nt = store.noteTimelines.get(id);
    if (!nt) {
      console.error('tried deleting a note without NoteTimeline');
      return;
    } else {
      store.noteTimelines.set(nt.noteId, modifyDelete(nt));
      console.log('added note removal operation', { nt });
    }
  });
};

export const localUpdateText = (id: Note['id'], newText: string) => {
  updateStore(store => {
    const nt = store.noteTimelines.get(id);
    if (!nt) {
      console.error('tried updating text of a note without NoteTimeline');
      return;
    } else {
      store.noteTimelines.set(nt.noteId, modifyText(nt, newText));
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
    store.noteTimelines.set(nt.noteId, nt);
  });
};
