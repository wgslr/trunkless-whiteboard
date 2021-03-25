import { TypedEmitter } from 'tiny-typed-emitter';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { clientState } from '../store/auth';

const encode = (message: ClientToServerMessage) =>
  ClientToServerMessage.encode(message).finish();

const decode = (message: Uint8Array) => ServerToClientMessage.decode(message);

interface Events {
  message: (decoded: ServerToClientMessage) => void;
  disconnected: () => void;
  connected: () => void;
}

export class ProtobufSocketClient extends TypedEmitter<Events> {
  socket: WebSocket;

  constructor(socketUrl: string) {
    super();
    console.log(`Connecting to websocket '${socketUrl}'`);
    this.socket = new WebSocket(socketUrl);
    this.socket.binaryType = 'arraybuffer';
    clientState.v = { state: 'CONNECTING' };

    this.socket.addEventListener('message', event => {
      let array = new Uint8Array(event.data);
      this.emit('message', decode(array));
    });
    this.socket.addEventListener('close', () => {
      this.emit('disconnected');
    });
    this.socket.addEventListener('open', () => {
      console.log(`Connected to websocket`);
      this.emit('connected');
    });
    this.socket.addEventListener('error', event => {
      console.error('Websocket reported error:', event);
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
