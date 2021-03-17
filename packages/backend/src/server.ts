import express from 'express';
import * as WebSocket from 'ws';
import { registerClient } from './models/client-connection';
import * as http from 'http';
import * as path from 'path';

const app = express();
// Static is relative to where node is executed
app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const wsserver = new WebSocket.Server({ server, path: '/ws' });

wsserver.on('connection', (websocket: WebSocket) => {
  console.log('Incoming websocket connection');

  registerClient(websocket);
  console.log('Connection registered');
});

export default server;
