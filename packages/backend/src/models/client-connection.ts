import { Reader } from 'protobufjs';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import type * as WebSocket from 'ws';
import { dispatch } from '../controllers/router';
import { decodeUUID, resultToMessage } from '../encoding';
import {
  ClientToServerMessage,
  Line,
  Note as NoteMsg,
  ServerToClientMessage
} from '../protocol/protocol';
import {
  addWhiteboard,
  connectClient,
  Note,
  Whiteboard,
  OperationType,
  countWhiteboards
} from './whiteboard';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  message: (decoded: ClientToServerMessage) => void;
}

// TODO move to other module
const encodeNote = (note: Note): NoteMsg => ({
  id: Uint8Array.from(uuid.parse(note.id)),
  content: note.content,
  coordinates: note.location
});

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
  whiteboard?: Whiteboard;

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setupSocketListeners();

    // @ts-ignore
    this.on('message', msg => dispatch(msg, this));

    // TODO do proper handshake and select whiteboard
    if (countWhiteboards() == 0) {
      this.whiteboard = addWhiteboard(this, uuid.NIL);
    } else {
      connectClient(this, uuid.NIL);
    }
  }

  private setupSocketListeners() {
    this.socket.on('message', (message: Uint8Array) => {
      console.log(`Client connection received a message: '${message}''`);
      // const decoded = decodeMessage(message as string);
      let decoded;
      try {
        decoded = ClientToServerMessage.decode(Reader.create(message));
        console.debug({ decoded });
        // @ts-ignore
      } catch (error) {
        console.error('Error decoding message', error);
        return;
      }
      this.emit('message', decoded);
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }

  public send(message: ServerToClientMessage) {
    const encoded = ServerToClientMessage.encode(message).finish();
    this.socket.send(encoded);
  }
}
export const registerClient = (socket: WebSocket) => {
  const conn = new ClientConnection(socket);
  connections.push(conn);
  conn.on('disconnect', () => {
    connections = connections.filter(c => c !== conn);
  });
};
