import { TypedEmitter } from 'tiny-typed-emitter';
import { Message, Coordinate } from './types';
import { ClientToServerMessage, Line } from './protocol/protocol';

declare interface ServerConnectionEvents {
  disconnect: () => void;
  message: (decoded: Message) => void;
}

export class ServerConnection extends TypedEmitter<ServerConnectionEvents> {
  socket: WebSocket;
  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.on('message', msg => this.dispatch(msg));
  }

  private dispatch(message: Message) {
    console.log('MESSAGE RECEIVED:', message);
  }

  public publishLine([start, end]: [Coordinate, Coordinate]) {
    const id = Uint8Array.from([1]);
    const lineDrawn = { id, start, end };

    const encoded = ClientToServerMessage.encode({
      body: { $case: 'lineDrawn', lineDrawn }
    }).finish();

    this.socket.send(encoded);
  }
}
