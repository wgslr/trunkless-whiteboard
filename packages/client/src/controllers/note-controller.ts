import { v4 } from 'uuid';
import {
  makeCreateNoteMessage,
  makeDeleteNoteMessage,
  makeUpdateNoteTextMessage,
  makeUpdateNotePositionMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import {
  discardPatch,
  localAddNote,
  localDeleteNote,
  localUpdateText,
  localMoveNote
} from '../store/notes';
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
): void => {
  const patchId = localUpdateText(figureId, text);
  const body: ClientToServerMessage['body'] = makeUpdateNoteTextMessage(
    figureId,
    text
  );
  reqResponseService.send(body, () => discardPatch(figureId, patchId));
};

export const deleteNote = (figureId: Note['id']): void => {
  const patchId = localDeleteNote(figureId);
  if (patchId !== null) {
    const body: ClientToServerMessage['body'] = makeDeleteNoteMessage(figureId);
    reqResponseService.send(body, () => discardPatch(figureId, patchId));
  }
};

export const moveNote = (
  figureId: Note['id'],
  newX: number,
  newY: number
): void => {
  const patchId = localMoveNote(figureId, newX, newY);
  const body: ClientToServerMessage['body'] = makeUpdateNotePositionMessage(
    figureId,
    { x: newX, y: newY }
  );
  reqResponseService.send(body, () => discardPatch(figureId, patchId));
};
