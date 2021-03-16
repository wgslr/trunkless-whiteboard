import * as uuid from 'uuid';
import {
  ClientToServerMessage,
  Coordinates,
  Note as NoteProto
} from '../protocol/protocol';
import type { Note, UUID } from '../types';
import { Line } from '../types';
import { Line as LineProto } from '../protocol/protocol';

export function lineToMessage(line: Line): ClientToServerMessage['body'] {
  const id = encodeUUID(line.id);
  const lineDrawn = {
    id,
    bitmap: [...line.points].map(entry => ({
      coordinates: entry,
      value: 1
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

export function decodeLineData(data: LineProto): Line {
  const points = data.bitmap.filter(p => p.value == 1).map(p => p.coordinates!);

  return {
    id: decodeUUID(data.id),
    points
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
