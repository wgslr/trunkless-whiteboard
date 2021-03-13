import * as uuid from 'uuid';
import { Note } from './models/whiteboard';
import {
  Line,
  ServerToClientMessage,
  Note as NoteProto
} from './protocol/protocol';
import type { Result, UUID } from './types';

export const encodeUUID = (id: UUID): Uint8Array =>
  Uint8Array.from(uuid.parse(id));

export const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

export const resultToMessage = (
  result: Result,
  responseTo: string
): ServerToClientMessage['body'] => {
  if (result.result === 'success') {
    return {
      $case: 'success',
      success: { triggeredBy: responseTo }
    };
  } else {
    return {
      $case: 'error',
      error: { triggeredBy: responseTo, reason: result.reason }
    };
  }
};

export const messageToLine = (data: Line) => {
  return {
    id: decodeUUID(data.id),
    bitmap: new Map(data.bitmap.map(point => [point.coordinates!, point.value]))
  };
};

// TODO move to other module
const encodeNote = (note: Note): NoteProto => ({
  id: Uint8Array.from(uuid.parse(note.id)),
  content: note.content,
  coordinates: note.location
});

export const newServerToClientMessage = (
  body: ServerToClientMessage['body']
): ServerToClientMessage => ({
  messsageId: uuid.v4(),
  body
});
