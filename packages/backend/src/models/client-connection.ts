import { Reader } from 'protobufjs';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import type * as WebSocket from 'ws';
import { dispatch } from '../controllers/router';
import { newServerToClientMessage } from '../encoding';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import {
  addWhiteboard,
  connectClient,
  countWhiteboards,
  Whiteboard
} from './whiteboard';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  // eslint-disable-next-line no-unused-vars
  message: (decoded: ClientToServerMessage) => void;
}

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
  whiteboard?: Whiteboard;

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setupSocketListeners();

    this.on('message', msg => dispatch(msg, this));

    // TODO do proper handshake and select whiteboard
    if (countWhiteboards() == 0) {
      this.whiteboard = addWhiteboard(this, uuid.NIL);
    } else {
      connectClient(this, uuid.NIL);
    }
  }

  private setupSocketListeners() {
    this.socket.on('message', (message: Uint8Array) => {
      // const decoded = decodeMessage(message as string);
      let decoded;
      try {
        decoded = ClientToServerMessage.decode(Reader.create(message));
        console.debug(`Received messaeg:`, { decoded });
      } catch (error) {
        console.error('Error decoding message', error);
        return;
      }
      this.emit('message', decoded);
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }

  public send(body: ServerToClientMessage['body'], previousMessageId?: string) {
    const message: ServerToClientMessage = {
      messsageId: uuid.v4(),
      body
    };
    if (previousMessageId) {
      message.causedBy = previousMessageId;
    }

    const encoded = ServerToClientMessage.encode(message).finish();
    this.socket.send(encoded);
  }
}

export const registerClient = (socket: WebSocket): void => {
  const conn = new ClientConnection(socket);
  connections.push(conn);
  conn.on('disconnect', () => {
    connections = connections.filter(c => c !== conn);
  });
};
