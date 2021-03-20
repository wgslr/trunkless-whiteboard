import * as uuid from 'uuid';
import {
  ClientToServerMessage,
  Line as LineProto,
  Note as NoteProto
} from '../protocol/protocol';
import type { Line, Note, UUID } from '../types';
import { coordToNumber, numberToCoord } from '../utils';

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

export const makeUpdateNotePositionMessage = (
  id: Note['id'],
  position: Note['position']
): ClientToServerMessage['body'] => ({
  $case: 'updateNotePosition',
  updateNotePosition: { noteId: encodeUUID(id), position }
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
    points: [...points].map(numberToCoord)
  }
});

export const makeRemovePointsFromLineMessage = (
  lineId: Line['id'],
  points: Line['points']
): ClientToServerMessage['body'] => ({
  $case: 'removePointsFromLine',
  removePointsFromLine: {
    lineId: encodeUUID(lineId),
    points: [...points].map(numberToCoord)
  }
});

export const makeDeleteLineMessage = (
  lineId: Line['id']
): ClientToServerMessage['body'] => ({
  $case: 'deleteLine',
  deleteLine: {
    lineId: encodeUUID(lineId)
  }
});

export const makeClientHelloMessage = (
  username: string
): ClientToServerMessage['body'] => ({
  $case: 'clientHello',
  clientHello: {
    username
  }
});

export const makeJoinWhiteboardMessage = (
  whiteboardId: string
): ClientToServerMessage['body'] => ({
  $case: 'joinWhiteboard',
  joinWhiteboard: {
    whiteboardId: encodeUUID(whiteboardId)
  }
});

export const makeCreateWhiteboardMessage = (): ClientToServerMessage['body'] => ({
  $case: 'createWhiteboardRequest',
  createWhiteboardRequest: {}
});

export const makeApproveOrDenyJoinMessage = (
  approved: boolean,
  clientId: string
): ClientToServerMessage['body'] => ({
  $case: 'approveOrDenyJoin',
  approveOrDenyJoin: {
    approve: approved,
    clientId: encodeUUID(clientId)
  }
});

// TODO deduplciate with backend code
const encodeUUID = (id: UUID): Uint8Array => Uint8Array.from(uuid.parse(id));

const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

export function decodeLineData(data: LineProto): Line {
  const points = data.points;

  return {
    id: decodeUUID(data.id),
    points: new Set(data.points.map(coordToNumber))
  };
}

export function lineToMessage(line: Line): LineProto {
  return {
    id: encodeUUID(line.id),
    points: [...line.points].map(numberToCoord)
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
