import express from 'express';
import wsServer from './ws-server';

const app = express();
const server = app.listen(3000);

enum Event {
  UPGRADE = 'upgrade',
  CONNECTION = 'connection'
}

server.on(Event.UPGRADE, (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit(Event.CONNECTION, socket, request);
  });
});
