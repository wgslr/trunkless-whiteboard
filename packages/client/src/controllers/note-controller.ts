import { v4 } from 'uuid';
import {
  makeCreateNoteMessage,
  makeUpdateNoteTextMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import { discardPatch, localAddNote, localUpdateText } from '../store/notes';
import type { Coordinates, Note } from '../types';

export const addNote = (position: Coordinates, text: string = 'a new note') => {
  const note = { id: v4(), position, text };
  const patchId = localAddNote(note);
  const body: ClientToServerMessage['body'] = makeCreateNoteMessage(note);
  reqResponseService.send(body, () => {
    // No need to check the response.
    // If success - the change is already incorporated into
    // state sent by server. If not, discarding the patch
    // undoes the changes.
    discardPatch(note.id, patchId);
  });
};

export const updateNoteText = (
  figureId: Note['id'],
  text: string = 'a new note'
) => {
  const patchId = localUpdateText(figureId, text);
  const body: ClientToServerMessage['body'] = makeUpdateNoteTextMessage(
    figureId,
    text
  );
  reqResponseService.send(body, () => discardPatch(figureId, patchId));
};
