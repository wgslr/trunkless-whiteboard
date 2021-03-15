import { v4 } from 'uuid';
import { updateStore } from '.';
import { createNoteMessage } from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import { Coordinates, Note } from '../types';
import {
  discardPatch,
  modifyDelete,
  modifyText,
  newCommittedNoteTimeline,
  newLocalNoteTimeline,
  setCommitted
} from './timelines/note';

// TODO change name, if we are doing server push in this function
export const localAddNote = (pos: Coordinates) => {
  const nt = newLocalNoteTimeline({
    id: v4(),
    position: pos,
    text: 'a new note'
  });
  updateStore(store => {
    store.noteTimelines.set(nt.noteId, nt);
  });

  // TODO very dirty
  const thePatch = nt.patches[nt.patches.length - 1];
  const note = {
    ...(thePatch.diff as Omit<Note, 'id'>),
    id: nt.noteId
  };
  const body: ClientToServerMessage['body'] = createNoteMessage(note);

  reqResponseService.send(body, response => {
    if (response == 'timeout') {
      console.error('note creae TIMEOUT');
    }
    updateStore(store => {
      const nt2 = store.noteTimelines.get(nt.noteId);
      if (nt2) {
        store.noteTimelines.set(
          nt2?.noteId,
          discardPatch(nt2, thePatch.changeId)
        );
      }
    });
  });

  // serverConnection.connection.publishNote();
  // TODO discard Patch from the timeline when server response comes
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
  const patchId = updateStore(store => {
    const nt = store.noteTimelines.get(id);
    if (nt) {
      const [newNT, patchId] = modifyText(nt, newText);
      store.noteTimelines.set(nt.noteId, newNT);
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
    store.noteTimelines.set(nt.noteId, nt);
  });
};
