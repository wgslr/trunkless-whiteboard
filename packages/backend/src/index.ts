import express from 'express';
// import wsServer from './ws-server';
import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import { TypedEmitter } from 'tiny-typed-emitter';

const PORT = 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const wsserver = new WebSocket.Server({ server });

enum Event {
  UPGRADE = 'upgrade',
  CONNECTION = 'connection'
}

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
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }
}

let connections: ClientConnection[] = [];

const registerConnection = (socket: WebSocket) => {
  const conn = new ClientConnection(socket);
  connections.push(conn);
  conn.on('disconnect', () => {
    connections = connections.filter(c => c !== conn);
  });
};

wsserver.on('connection', (websocket: WebSocket, request) => {
  console.log('Incoming websocket connection');

  registerConnection(websocket);
  console.log('Connection registered');
});

setInterval(() => {
  console.log(`There are ${connections.length} connections`);
}, 2000);

// server.on(Event.UPGRADE, (request, socket, head) => {
//   wsserver.handleUpgrade(request, socket, head, socket => {
//     wsserver.emit(Event.CONNECTION, socket, request);
//   });
// });
