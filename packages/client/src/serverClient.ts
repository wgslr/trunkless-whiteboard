import { TypedEmitter } from 'tiny-typed-emitter';
import type { UUID } from './types';
import * as uuid from 'uuid';
import { Message, Line } from './types';
import {
  ClientToServerMessage,
  ServerToClientMessage,
  Line as ProtoLine
} from './protocol/protocol';
import * as whiteboard from './editor/whiteboard';
import DataLoader from 'dataloader';

declare interface ServerConnectionEvents {
  disconnect: () => void;
  message: (decoded: Message) => void;
}

export class ServerConnection extends TypedEmitter<ServerConnectionEvents> {
  socket: WebSocket;
  lineLoader: DataLoader<ProtoLine, void>;
  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.socket.binaryType = 'arraybuffer';
    this.socket.onmessage = event => this.dispatch(event);
    this.lineLoader = new DataLoader(this.batchLines(this.socket), {
      batchScheduleFn: callback => setTimeout(callback, 500)
    });
  }

  private dispatch(event: MessageEvent) {
    let array = new Uint8Array(event.data);
    const decoded = ServerToClientMessage.decode(array);

    switch (decoded.body?.$case) {
      case 'lineDrawn': {
        const lineData = decodeLineData(decoded.body.lineDrawn);
        // TODO encapsulate it in the whiteboard module
        // TODO ignore on the client that created the line
        whiteboard.bitmap.push({ UUID: lineData.id, points: lineData.bitmap });
      }
    }
  }

  private batchLines(socket: WebSocket) {
    return async (lines: readonly ProtoLine[]) => {
      const encoded = ClientToServerMessage.encode({
        body: {
          $case: 'linesDrawn',
          linesDrawn: {
            // @ts-ignore: mutability shouldn't matter
            lines
          }
        }
      }).finish();
      socket.send(encoded);
      // Hack to make DataLoader work
      return lines.map(() => void {});
    };
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
    this.lineLoader.load(lineDrawn);
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
