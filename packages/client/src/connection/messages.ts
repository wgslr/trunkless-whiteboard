import * as uuid from 'uuid';
import {
  ClientToServerMessage,
  Line as LineProto,
  Note as NoteProto
} from '../protocol/protocol';
import type { Line, Note, UUID } from '../types';

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

export const makeCreateLineMessage = (
  line: Line
): ClientToServerMessage['body'] => ({
  $case: 'createLine',
  createLine: {
    line: lineToMessage(line)
  }
});

export const makeAddPointsToLineMessage = (
  lineId: Line['id'],
  points: Line['points']
): ClientToServerMessage['body'] => ({
  $case: 'addPointsToLine',
  addPointsToLine: {
    lineId: encodeUUID(lineId),
    points: points
  }
});

// TODO deduplciate with backend code
const encodeUUID = (id: UUID): Uint8Array => Uint8Array.from(uuid.parse(id));

const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

export function decodeLineData(data: LineProto): Line {
  const points = data.points;

  return {
    id: decodeUUID(data.id),
    points
  };
}

export function lineToMessage(line: Line): LineProto {
  return {
    ...line,
    id: encodeUUID(line.id)
  };
}

export function noteToMessage(note: Note): NoteProto {
  return {
    ...note,
    id: encodeUUID(note.id)
  };
}

export function messageToNote(noteMsg: NoteProto): Note {
  return {
    id: uuid.stringify(noteMsg.id),
    text: noteMsg.text,
    position: noteMsg.position!
  };
}
