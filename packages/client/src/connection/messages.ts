import * as uuid from 'uuid';
import {
  ClientToServerMessage,
  Line as LineProto,
  Note as NoteProto,
  Image as ImageProto
} from '../protocol/protocol';
import type { Line, Note, Img } from '../types';
import { coordToNumber, numberToCoord } from '../utils';
import { encodeUUID, decodeUUID } from 'encoding';

export const makeCreateImageMessage = (
  img: Img
): ClientToServerMessage['body'] => ({
  $case: 'createImage',
  createImage: {
    image: imageToMessage(img)
  }
});

export const makeUpdateImagePosMessage = (
  id: Img['id'],
  pos: Img['position']
): ClientToServerMessage['body'] => ({
  $case: 'updateImagePosition',
  updateImagePosition: { imageId: encodeUUID(id), position: pos }
});

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

export const decodeLineData = (data: LineProto): Line => ({
  id: decodeUUID(data.id),
  points: new Set(data.points.map(coordToNumber))
});

export const lineToMessage = (line: Line): LineProto => ({
  id: encodeUUID(line.id),
  points: [...line.points].map(numberToCoord)
});

export const noteToMessage = (note: Note): NoteProto => ({
  ...note,
  id: encodeUUID(note.id)
});

export const messageToNote = (noteMsg: NoteProto): Note => ({
  id: uuid.stringify(noteMsg.id),
  text: noteMsg.text,
  position: noteMsg.position!
});

export const imageToMessage = (img: Img): ImageProto => ({
  ...img,
  id: encodeUUID(img.id)
});

export const messageToImage = (imgMsg: ImageProto): Img => ({
  id: uuid.stringify(imgMsg.id),
  data: imgMsg.data,
  position: imgMsg.position!
});
