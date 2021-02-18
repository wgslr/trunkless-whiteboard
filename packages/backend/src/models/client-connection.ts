import type * as WebSocket from 'ws';
import { TypedEmitter } from 'tiny-typed-emitter';

let connections: ClientConnection[] = [];

// define possible listeners
declare interface ClientConnectionEvents {
  disconnect: () => void;
}

class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setUpListeners();
  }

  private setUpListeners() {
    this.socket.on('message', message => {
      console.log(`Client connection received a message: '${message}''`);
      // TODO protobuf unmarshaling
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }
}

export const registerClient = (socket: WebSocket) => {
  const conn = new ClientConnection(socket);
  connections.push(conn);
  conn.on('disconnect', () => {
    connections = connections.filter(c => c !== conn);
  });
};
