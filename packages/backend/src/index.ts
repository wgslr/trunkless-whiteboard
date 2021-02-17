import express from 'express';
import wsServer from './ws-server';

const PORT = 3001;

const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

enum Event {
  UPGRADE = 'upgrade',
  CONNECTION = 'connection'
}

server.on(Event.UPGRADE, (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit(Event.CONNECTION, socket, request);
  });
});
