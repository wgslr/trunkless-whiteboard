import { TypedEmitter } from 'tiny-typed-emitter';
import type * as WebSocket from 'ws';
import { connectClient, Note, Whiteboard } from './whiteboard';
import { addWhiteboard } from './whiteboard';
import {
  ClientToServerMessage,
  GetAllFiguresResponse,
  Note as NoteMsg,
  ServerToClientMessage
} from '../protocol/protocol';
import { Reader } from 'protobufjs';
import * as uuid from 'uuid';
import { decodeUUID, resultToMessage } from '../encoding';
import reportWebVitals from '../../../client/src/reportWebVitals';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  message: (decoded: ClientToServerMessage) => void;
}

// TODO move to other module
const encodeNote = (note: Note): NoteMsg => {
  return {
    id: Uint8Array.from(uuid.parse(note.id)),
    content: note.content,
    coordinates: note.location
  };
};

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
  whiteboard?: Whiteboard;

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setupSocketListeners();

    this.on('message', msg => this.dispatch(msg));
  }

  private setupSocketListeners() {
    this.socket.on('message', (message: Uint8Array) => {
      console.log(`Client connection received a message: '${message}''`);
      // const decoded = decodeMessage(message as string);
      const decoded = ClientToServerMessage.decode(Reader.create(message));
      console.debug({ decoded });
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
            body: {
              $case: 'getAllFiguresResponse',
              getAllFiguresResponse: {
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
      // default:
      // TODO send error about unrecognized message
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
