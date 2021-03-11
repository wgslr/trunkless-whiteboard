import { TypedEmitter } from 'tiny-typed-emitter';
import type { UUID } from './types';
import * as uuid from 'uuid';
import { Message, Coordinate, Line } from './types';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from './protocol/protocol';
import * as whiteboard from './editor/whiteboard';

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
    // console.log('MESSAGE RECEIVED:', event);
    let array = new Uint8Array(event.data);
    const decoded = ServerToClientMessage.decode(array);
    // console.log('decoded', decoded.body);

    switch (decoded.body?.$case) {
      case 'lineDrawn': {
        const lineData = decodeLineData(decoded.body.lineDrawn);
        // TODO encapsulate it in the whiteboard module
        // TODO ignore on the client that created the line
        whiteboard.bitmap.push({ UUID: lineData.id, points: lineData.bitmap });
      }
    }
  }

  public publishLine(line: Line) {
    console.log('Publish line');
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

// TODO deduplciate with backend code
const encodeUUID = (id: UUID): Uint8Array => Uint8Array.from(uuid.parse(id));

const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

function decodeLineData(data: any) {
  const bitmap = new Map();
  for (let point of data.bitmap) {
    bitmap.set(point.coordinates, point.value);
  }

  return {
    id: decodeUUID(data.id),
    bitmap
  };
}
