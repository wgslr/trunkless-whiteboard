import express from 'express';
// import wsServer from './ws-server';
import * as WebSocket from 'ws';
import { registerClient } from './models/client-connection';
import { countWhiteboards } from './models/whiteboard';
import * as http from 'http';

const app = express();
const server = http.createServer(app);
const wsserver = new WebSocket.Server({ server, path: '/ws' });

wsserver.on('connection', (websocket: WebSocket, request) => {
  console.log('Incoming websocket connection');

  registerClient(websocket);
  console.log('Connection registered');
});

export default server;
