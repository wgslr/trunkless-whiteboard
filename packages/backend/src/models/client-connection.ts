import { Reader } from 'protobufjs';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import type * as WebSocket from 'ws';
import { decodeUUID, resultToMessage } from '../encoding';
import {
  ClientToServerMessage,
  Note as NoteMsg,
  ServerToClientMessage
} from '../protocol/protocol';
import { addWhiteboard, connectClient, Note, Whiteboard } from './whiteboard';

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
    this.on('message', msg => this.dispatch(msg));
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

  // TODO extract a 'controller' to limti responsibility of this class, which should be concrened more about marshalling data
  private dispatch(message: ClientToServerMessage) {
    switch (message.body?.$case) {
      case 'createWhiteboardRequest': {
        this.whiteboard = addWhiteboard(this);
        break;
      }
      case 'getAllFiguresRequest': {
        if (this.whiteboard) {
          this.send({
            // @ts-ignore
            body: {
              $case: 'getAllFiguresResponse',
              getAllFiguresResponse: {
                // @ts-ignore: FIXME Figure and Note are not overlapping
                notes: [...this.whiteboard.figures.values()].map(encodeNote)
              }
            }
          });
        }
        break;
      }
      case 'joinWhiteboard': {
        const whiteboardId = decodeUUID(
          message.body.joinWhiteboard.whiteboardId
        );
        console.log(`Client wants to join whiteboard ${whiteboardId}`);
        const result = connectClient(this, whiteboardId);
        const response = resultToMessage(result);
        this.send(response);
        break;
      }
      case 'moveFigure': {
        // TODO
        break;
      }
      default: {
        // TODO send error about unrecognized message
        break;
      }
    }
  }
}

export const registerClient = (socket: WebSocket) => {
  const conn = new ClientConnection(socket);
  connections.push(conn);
  conn.on('disconnect', () => {
    connections = connections.filter(c => c !== conn);
  });
};
// define possible listeners

// setInterval(() => {
//   console.log(`There are ${connections.length} connections`);
// }, 2000);
