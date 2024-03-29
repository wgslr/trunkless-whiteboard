import { TypedEmitter } from 'tiny-typed-emitter';
import { v4 } from 'uuid';
import WebSocket from 'ws';
import { CLIENT_TIMEOUT, TARGET_ADDR } from './config';
import { receivedMessages, sentMessages } from './message-log';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from './protocol/protocol';

let clientCount = 0;

// eslint-disable-next-line no-unused-vars
type CallbackInternal = (message: ServerToClientMessage['body']) => void;

interface Events {
  // eslint-disable-next-line no-unused-vars
  message: (decoded: ServerToClientMessage) => void;
  disconnected: () => void;
  connected: () => void;
}

const encode = (message: ClientToServerMessage) =>
  ClientToServerMessage.encode(message).finish();

const decode = (message: Uint8Array) => ServerToClientMessage.decode(message);

export class ProtobufSocketClient extends TypedEmitter<Events> {
  name: string;
  socket: WebSocket;

  constructor(socketUrl: string) {
    super();
    this.socket = new WebSocket(socketUrl);
    this.socket.binaryType = 'arraybuffer';

    this.socket.addEventListener('message', event => {
      const timestamp = process.hrtime.bigint();
      const array = new Uint8Array(event.data);
      const message = decode(array);
      receivedMessages.push({
        timestamp,
        message,
        clientName: this.name,
        bufferAfterSending: this.socket.bufferedAmount
      });
      this.emit('message', message);
    });
    this.socket.addEventListener('close', () => {
      this.emit('disconnected');
    });
    this.socket.addEventListener('open', () => {
      this.emit('connected');
    });
    this.socket.addEventListener('error', event => {
      console.error('Websocket reported error:', event);
    });
  }

  public _send(message: ClientToServerMessage) {
    const encoded = encode(message);
    sentMessages.push({
      bufferBeforeSending: this.socket.bufferedAmount,
      clientName: this.name,
      message: message,
      timestamp: process.hrtime.bigint()
    });
    this.socket.send(encoded);
  }
}

export class Client extends ProtobufSocketClient {
  private messageIdToResponseHandler: Map<
    NonNullable<ServerToClientMessage['causedBy']>,
    CallbackInternal
  > = new Map();

  constructor() {
    super(TARGET_ADDR);
    ++clientCount;
    this.name = 'client' + clientCount.toString().padStart(6, '0');

    this.on('message', msg => {
      if (msg.causedBy) {
        const handler = this.messageIdToResponseHandler.get(msg.causedBy);
        if (handler) {
          handler(msg.body);
        }
      }
    });
  }

  public ensureConnected = (): Promise<void> =>
    new Promise(resolve => {
      const handler = () => {
        this.socket.removeEventListener('open', handler);
        resolve();
      };
      this.socket.addEventListener('open', handler);
    });

  public getNextMessage = (): Promise<ServerToClientMessage['body']> =>
    new Promise(resolve => {
      this.once('message', msg => resolve(msg.body));
    });

  public send = (
    body: ClientToServerMessage['body']
  ): Promise<ServerToClientMessage['body']> => {
    // returns promise resolving to server's response

    const message: ClientToServerMessage = {
      messageId: v4(),
      body
    };
    const { messageId } = message;

    const promise: Promise<ServerToClientMessage['body']> = new Promise(
      (resolve, reject) => {
        setTimeout(() => {
          if (this.messageIdToResponseHandler.delete(messageId)) {
            console.warn('Timeout on awaiting server response');
            reject('timeout');
          }
        }, CLIENT_TIMEOUT);

        this.messageIdToResponseHandler.set(message.messageId, response => {
          this.messageIdToResponseHandler.delete(message.messageId);
          if (response?.$case === 'error') {
            reject(response.error);
          } else {
            resolve(response);
          }
        });
      }
    );
    this._send(message);
    return promise;
  };
}
