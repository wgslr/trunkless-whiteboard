import { TypedEmitter } from 'tiny-typed-emitter';
import type * as WebSocket from 'ws';
import { Message } from '../api';
import type { Note, Whiteboard } from './whiteboard';
import { addWhiteboard } from './whiteboard';
import { MessageWrapper, Note as NoteMsg } from '../protocol/protocol';
import { Reader } from 'protobufjs';
import * as uuid from 'uuid';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  message: () => void;
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
      console.log(`Client connection received a message.`);
      const reader = Reader.create(message);
      const decoded = MessageWrapper.decode(reader);
      console.debug({ decoded });
      // @ts-ignore
      this.emit('message', decoded);
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }

  public send(message: MessageWrapper) {
    this.socket.send(MessageWrapper.encode(message));
  }

  // TODO extract a 'controller' to limti responsibility of this class, which should be concrened more about marshalling data
  private dispatch(message: Message) {
    // @ts-ignore
    const messageType = message.body?.$case;
    switch (messageType) {
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
      case 'figureMovedMsg': {
        // TODO
        break;
      }
      default:
        console.log(`ERROR: unknown message appeared "${messageType}"`);
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
