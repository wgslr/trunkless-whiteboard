import { encode } from 'node:punycode';
import * as uuid from 'uuid';
import {
  ClientToServerMessage,
  Note as NoteProto,
  ServerToClientMessage
} from '../protocol/protocol';
import { setServerState } from '../store/notes';
import type { Note, UUID } from '../types';
import { Line } from '../types';

export function lineToMessage(line: Line): ClientToServerMessage['body'] {
  const id = encodeUUID(line.UUID);
  const lineDrawn = {
    id,
    bitmap: Array.from(line.points.entries()).map(entry => ({
      coordinates: entry[0],
      value: entry[1]
    }))
  };

  return {
    $case: 'lineDrawn',
    lineDrawn
  };
}

export const makeCreateNoteMessage = (
  note: Note
): ClientToServerMessage['body'] => ({
  $case: 'createNote',
  createNote: {
    note: noteToMessage(note)
  }
});

export const makeUpdateNoteTextMessage = (
  id: Note['id'],
  text: Note['text']
): ClientToServerMessage['body'] => ({
  $case: 'updateNoteText',
  updateNoteText: { noteId: encodeUUID(id), text }
});

export const makeDeleteNoteMessage = (
  id: Note['id']
): ClientToServerMessage['body'] => ({
  $case: 'deleteNote',
  deleteNote: { noteId: encodeUUID(id) }
});

// TODO deduplciate with backend code
const encodeUUID = (id: UUID): Uint8Array => Uint8Array.from(uuid.parse(id));

const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

export function decodeLineData(data: any) {
  const bitmap = new Map();
  for (let point of data.bitmap) {
    bitmap.set(point.coordinates, point.value);
  }

  return {
    id: decodeUUID(data.id),
    bitmap
  };
}

export function noteToMessage(note: Note): NoteProto {
  return {
    ...note,
    id: Uint8Array.from(uuid.parse(note.id))
  };
}

export function messageToNote(noteMsg: NoteProto): Note {
  return {
    id: uuid.stringify(noteMsg.id),
    text: noteMsg.text,
    position: noteMsg.position!
  };
}
