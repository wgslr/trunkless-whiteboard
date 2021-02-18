import express from 'express';
// import wsServer from './ws-server';
import * as WebSocket from 'ws';
import { registerClient } from './models/client-connection';
import { countWhiteboards } from './models/whiteboard';

const PORT = 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const wsserver = new WebSocket.Server({ server, path: '/ws' });

wsserver.on('connection', (websocket: WebSocket, request) => {
  console.log('Incoming websocket connection');

  registerClient(websocket);
  console.log('Connection registered');
});