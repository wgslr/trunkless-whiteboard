import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import { Message, Coordinate, Line } from './types';
import { ClientToServerMessage } from './protocol/protocol';

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

  public publishLine(line: Line) {
    const id = encodeUUID(line.UUID);
    const lineDrawn = {
      id,
      bitmap: Array.from(line.points.entries()).map(entry => ({
        coordinates: entry[0],
        value: entry[1]
      }))
    };

    const encoded = ClientToServerMessage.encode({
      body: { $case: 'lineDrawn', lineDrawn }
    }).finish();

    this.socket.send(encoded);
  }
}

const encodeUUID = (id: string): Uint8Array => Uint8Array.from(uuid.parse(id));
