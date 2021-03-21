import { decodeUUID } from 'encoding';
import * as uuid from 'uuid';
import { Note, Line, Img } from './models/whiteboard';
import {
  ClientToServerMessage,
  ErrorReason,
  Line as LineProto,
  Note as NoteProto,
  Image as ImageProto,
  ServerToClientMessage
} from './protocol/protocol';
import type { Result } from './types';

export type ClientToServerCase = NonNullable<
  ClientToServerMessage['body']
>['$case'];

export const resultToMessage = (
  result: Result
): ServerToClientMessage['body'] => {
  if (result.result === 'success') {
    return makeSuccessMessage();
  } else {
    return makeErrorMessage(result.reason);
  }
};

export const makeSuccessMessage = (): ServerToClientMessage['body'] => ({
  $case: 'success',
  success: {}
});

export const makeErrorMessage = (
  reason: ErrorReason
): ServerToClientMessage['body'] => ({
  $case: 'error',
  error: { reason }
});

export const messageToLine = (data: LineProto): Line => ({
  id: decodeUUID(data.id),
  points: data.points
});

export const noteToMessage = (note: Note): NoteProto => ({
  ...note,
  id: Uint8Array.from(uuid.parse(note.id))
});

export const messageToNote = (noteMsg: NoteProto): Note => ({
  id: uuid.stringify(noteMsg.id),
  text: noteMsg.text,
  position: noteMsg.position!
});

export const imageToMessage = (img: Img): ImageProto => ({
  ...img,
  id: Uint8Array.from(uuid.parse(img.id))
});

export const messageToImage = (imgMsg: ImageProto): Img => ({
  id: uuid.stringify(imgMsg.id),
  data: imgMsg.data,
  position: imgMsg.position!
});

export const newServerToClientMessage = (
  body: ServerToClientMessage['body']
): ServerToClientMessage => ({
  messageId: uuid.v4(),
  body
});
