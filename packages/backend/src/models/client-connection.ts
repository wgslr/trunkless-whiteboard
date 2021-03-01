import { TypedEmitter } from 'tiny-typed-emitter';
import type * as WebSocket from 'ws';
import {
  decodeMessage,
  encode,
  GetAllRespMsg,
  Message,
  MessageCode
} from '../api';
import type { Whiteboard } from './whiteboard';
import { addWhiteboard } from './whiteboard';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  message: (decoded: Message) => void;
}

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
    this.socket.on('message', message => {
      console.log(`Client connection received a message: '${message}''`);
      const decoded = decodeMessage(message as string);
      this.emit('message', decoded);
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }

  public send(message: Message) {
    this.socket.send(encode(message));
  }

  // TODO extract a 'controller' to limti responsibility of this class, which should be concrened more about marshalling data
  private dispatch(message: Message) {
    if (message.code === MessageCode.CREATE_WHITEBOARD) {
      addWhiteboard(this);
    } else if (message.code === MessageCode.GET_ALL_REQ) {
      if (this.whiteboard) {
        this.send(new GetAllRespMsg([...this.whiteboard.figures.values()]));
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
