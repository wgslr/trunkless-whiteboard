import type * as WebSocket from 'ws';
import { TypedEmitter } from 'tiny-typed-emitter';
import { decodeMessage, Message, MessageCode } from '../api';
import { addWhiteboard } from './whiteboard';

let connections: ClientConnection[] = [];

// define possible listeners
declare interface ClientConnectionEvents {
  disconnect: () => void;
  message: (decoded: Message) => void;
}

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
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

  private dispatch(message: Message) {
    if (message.code === MessageCode.CREATE_WHITEBOARD) {
      addWhiteboard(this);
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

// setInterval(() => {
//   console.log(`There are ${connections.length} connections`);
// }, 2000);
