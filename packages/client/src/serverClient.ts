import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import { Message, Coordinate, Line } from './types';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from './protocol/protocol';

declare interface ServerConnectionEvents {
  disconnect: () => void;
  message: (decoded: Message) => void;
}

export class ServerConnection extends TypedEmitter<ServerConnectionEvents> {
  socket: WebSocket;
  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.socket.binaryType = 'arraybuffer';
    this.socket.onmessage = event => this.dispatch(event);
  }

  private dispatch(event: MessageEvent) {
    console.log('MESSAGE RECEIVED:', event);
    let array = new Uint8Array(event.data);
    const decoded = ServerToClientMessage.decode(array);
    console.log('decoded', decoded.body);
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
