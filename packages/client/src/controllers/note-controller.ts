import { v4 } from 'uuid';
import { createNoteMessage } from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import { discardPatch, localAddNote } from '../store/notes';
import { Coordinates } from '../types';

export const addNote = (position: Coordinates, text: string = 'a new note') => {
  const note = { id: v4(), position, text };
  const patchId = localAddNote(note);
  const body: ClientToServerMessage['body'] = createNoteMessage(note);
  reqResponseService.send(body, () => {
    // No need to check the response.
    // If success - the change is already incorporated into
    // state sent by server. If not, discarding the patch
    // undoes the changes.
    discardPatch(note.id, patchId);
  });
};
