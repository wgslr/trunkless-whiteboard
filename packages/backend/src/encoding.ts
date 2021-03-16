import * as uuid from 'uuid';
import { Note } from './models/whiteboard';
import {
  Line,
  ServerToClientMessage,
  Note as NoteProto,
  ErrorReason,
  ClientToServerMessage
} from './protocol/protocol';
import type { Result, UUID } from './types';

export type ClientToServerCase = NonNullable<
  ClientToServerMessage['body']
>['$case'];

export const encodeUUID = (id: UUID): Uint8Array =>
  Uint8Array.from(uuid.parse(id));

export const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

export const resultToMessage = (
  result: Result
): ServerToClientMessage['body'] => {
  if (result.result === 'success') {
    return {
      $case: 'success',
      success: {}
    };
  } else {
    return makeErrorMessage(result.reason);
  }
};

export const makeErrorMessage = (
  reason: ErrorReason
): ServerToClientMessage['body'] => ({
  $case: 'error',
  error: { reason }
});

export const messageToLine = (data: Line) => {
  return {
    id: decodeUUID(data.id),
    bitmap: new Map(data.bitmap.map(point => [point.coordinates!, point.value]))
  };
};

export const noteToMessage = (note: Note): NoteProto => ({
  ...note,
  id: Uint8Array.from(uuid.parse(note.id))
});

export const messageToNote = (noteMsg: NoteProto): Note => ({
  id: uuid.stringify(noteMsg.id),
  text: noteMsg.text,
  position: noteMsg.position!
});

export const newServerToClientMessage = (
  body: ServerToClientMessage['body']
): ServerToClientMessage => ({
  messsageId: uuid.v4(),
  body
});
