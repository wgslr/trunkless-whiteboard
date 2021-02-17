import { Server } from 'ws';

enum WSEvent {
  CONNECTION = 'connection',
  MESSAGE = 'message',
  ERROR = 'error'
}

const wsServer = new Server({ noServer: true });

wsServer.on(WSEvent.CONNECTION, socket => {
  socket.on(WSEvent.MESSAGE, message => {
    console.log(message);
    socket.send(new Int32Array([21, 31]));
  });
});
wsServer.on(WSEvent.ERROR, err => {
  console.error('WebSocket server error', err);
});

export default wsServer;
