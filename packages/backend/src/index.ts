import express from 'express';
// import wsServer from './ws-server';
import { Server } from 'ws';

const PORT = 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const wsserver = new Server({ server });

enum Event {
  UPGRADE = 'upgrade',
  CONNECTION = 'connection'
}

wsserver.on('connection', (websocket, request) => {
  console.log('Incoming websocket connection', { websocket, request });
  websocket.on('message', (msg: any) => {
    console.log('Incoming msg', msg);
  });
  console.log('Set up listener');
});

// server.on(Event.UPGRADE, (request, socket, head) => {
//   wsserver.handleUpgrade(request, socket, head, socket => {
//     wsserver.emit(Event.CONNECTION, socket, request);
//   });
// });
