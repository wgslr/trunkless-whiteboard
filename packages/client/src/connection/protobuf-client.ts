import { TypedEmitter } from 'tiny-typed-emitter';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';

const encode = (message: ClientToServerMessage) =>
  ClientToServerMessage.encode(message).finish();

const decode = (message: Uint8Array) => ServerToClientMessage.decode(message);

interface Events {
  message: (decoded: ServerToClientMessage) => void;
  disconnect: () => void;
}

export class ProtobufSocketClient extends TypedEmitter<Events> {
  socket: WebSocket;

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.socket.binaryType = 'arraybuffer';

    this.socket.addEventListener('message', event => {
      let array = new Uint8Array(event.data);
      this.emit('message', decode(array));
    });
    this.socket.addEventListener('close', () => {
      this.emit('disconnect');
    });
  }

  public send(message: ClientToServerMessage) {
    const encoded = encode(message);
    this.socket.send(encoded);
  }
}

// export const getBodyContent = (body: ServerToClientMessage['body']): (!body) return undefined;
//   const $case = body.$case;
//   return body[$case];
// };
