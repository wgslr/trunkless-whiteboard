import { decodeUUID, encodeUUID } from 'encoding';
import * as uuid from 'uuid';
import { Img, Line, Note } from './models/whiteboard';
import {
  ClientToServerMessage,
  ErrorReason,
  Image as ImageProto,
  Line as LineProto,
  Note as NoteProto,
  ServerToClientMessage
} from './protocol/protocol';

export type ClientToServerCase = NonNullable<
  ClientToServerMessage['body']
>['$case'];

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
  id: encodeUUID(note.id),
  creatorId: note.creatorId ? encodeUUID(note.creatorId) : undefined
});

export const messageToNote = (noteMsg: NoteProto): Note => ({
  id: uuid.stringify(noteMsg.id),
  text: noteMsg.text,
  position: noteMsg.position!,
  creatorId: noteMsg.creatorId ? decodeUUID(noteMsg.creatorId) : undefined
});

export const imageToMessage = (img: Img): ImageProto => ({
  ...img,
  id: Uint8Array.from(uuid.parse(img.id))
});

export const messageToImage = (imgMsg: ImageProto): Img => ({
  id: uuid.stringify(imgMsg.id),
  data: imgMsg.data,
  position: imgMsg.position!,
  zIndex: imgMsg.zIndex
});

export const newServerToClientMessage = (
  body: ServerToClientMessage['body']
): ServerToClientMessage => ({
  messageId: uuid.v4(),
  body
});
