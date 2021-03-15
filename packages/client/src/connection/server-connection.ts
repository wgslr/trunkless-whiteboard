import { TypedEmitter } from 'tiny-typed-emitter';
import type { Note, UUID } from '../types';
import * as uuid from 'uuid';
import { Message, Coordinates, Line } from '../types';
import {
  ClientToServerMessage,
  ServerToClientMessage,
  Note as NoteProto
} from '../protocol/protocol';
import * as whiteboard from '../editor/whiteboard';
import { setServerState } from '../store/notes';

export class ServerConnection {
  socket: WebSocket;
  constructor(socket: WebSocket) {
    this.socket = socket;
    this.socket.binaryType = 'arraybuffer';
    this.socket.onmessage = event => this.dispatch(event);
  }

  private dispatch(event: MessageEvent) {
    // console.log('MESSAGE RECEIVED:', event);
    let array = new Uint8Array(event.data);
    const decoded = ServerToClientMessage.decode(array);
    console.log(`Received message: ${decoded.body?.$case}`);
    console.debug(`Received message body:`, decoded.body);

    switch (decoded.body?.$case) {
      case 'lineDrawn': {
        const lineData = decodeLineData(decoded.body.lineDrawn);
        // TODO encapsulate it in the whiteboard module
        // TODO ignore on the client that created the line
        whiteboard.bitmap.push({ UUID: lineData.id, points: lineData.bitmap });
        break;
      }
      case 'noteCreatedOrUpdated': {
        const noteData = messageToNote(decoded.body.noteCreatedOrUpdated.note!);
        setServerState(noteData.id, noteData);
      }
    }
  }

  public publishLine(line: Line) {
    console.log('Publish line');
    const id = encodeUUID(line.UUID);
    const lineDrawn = {
      id,
      bitmap: Array.from(line.points.entries()).map(entry => ({
        coordinates: entry[0],
        value: entry[1]
      }))
    };

    const body: ClientToServerMessage['body'] = {
      $case: 'lineDrawn',
      lineDrawn
    };
    this.send(body);
  }

  public publishNote(note: Note) {
    const body: ClientToServerMessage['body'] = {
      $case: 'createNote',
      createNote: {
        note: noteToMessage(note)
      }
    };
    this.send(body);
  }

  private send(body: ClientToServerMessage['body']) {
    const encoded = ClientToServerMessage.encode(
      newClientToServerMessage(body)
    ).finish();
    this.socket.send(encoded);
  }
}

function newClientToServerMessage(
  body: ClientToServerMessage['body']
): ClientToServerMessage {
  return { messsageId: uuid.v4(), body };
}

// TODO deduplciate with backend code
const encodeUUID = (id: UUID): Uint8Array => Uint8Array.from(uuid.parse(id));

const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

function decodeLineData(data: any) {
  const bitmap = new Map();
  for (let point of data.bitmap) {
    bitmap.set(point.coordinates, point.value);
  }

  return {
    id: decodeUUID(data.id),
    bitmap
  };
}

function noteToMessage(note: Note): NoteProto {
  return {
    ...note,
    id: Uint8Array.from(uuid.parse(note.id))
  };
}

function messageToNote(noteMsg: NoteProto): Note {
  return {
    id: uuid.stringify(noteMsg.id),
    text: noteMsg.text,
    position: noteMsg.position!
  };
}
