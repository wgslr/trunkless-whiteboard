import { Server } from 'ws';

enum WSEvent {
  CONNECTION = 'connection',
  MESSAGE = 'message'
}

const wsServer = new Server({ noServer: true });

wsServer.on(WSEvent.CONNECTION, socket =>
  socket.on(WSEvent.MESSAGE, message => console.log(message))
);

export default wsServer;
