import { TypedEmitter } from 'tiny-typed-emitter';
import { Message, Coordinate } from './types';
import { Line } from './protocol/protocol';

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
    const line = Line.encode({ id , start, end })
    console.log('RECEIVED:', line);
  }
}
