import express from 'express';
// import wsServer from './ws-server';
import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

const PORT = 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const wsserver = new WebSocket.Server({ server });

enum Event {
  UPGRADE = 'upgrade',
  CONNECTION = 'connection'
}

enum ClientConnectionEvent {
  DISCONNECT = 'disconnect'
}

// define possible listeners
declare interface ClientConnection {
  on(event: ClientConnectionEvent.DISCONNECT, listener: () => void): this;
  on(event: string, listener: Function): this;
}

class ClientConnection extends EventEmitter {
  socket: WebSocket;
  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setUpListeners();
  }

  private setUpListeners() {
    this.socket.on('message', (message: WebSocket.Data) => {
      console.log(`Client connection received a message: '${message}''`);
      this.emit(ClientConnectionEvent.DISCONNECT);
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit(ClientConnectionEvent.DISCONNECT);
    });
  }
}

wsserver.on('connection', (websocket, request) => {
  console.log('Incoming websocket connection', { websocket, request });
  websocket.on('message', (msg: any) => {
    console.log('Incoming msg', msg);
  });
  websocket.on('close', () => {
    console.log('Connetion closed');
  });

  console.log('Set up listener');
});

// server.on(Event.UPGRADE, (request, socket, head) => {
//   wsserver.handleUpgrade(request, socket, head, socket => {
//     wsserver.emit(Event.CONNECTION, socket, request);
//   });
// });
