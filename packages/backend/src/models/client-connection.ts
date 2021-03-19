import { Reader } from 'protobufjs';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import type * as WebSocket from 'ws';
import { dispatch } from '../controllers/router';
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

type WhiteboardMembershipState =
  | {
      kind: 'NO_WHITEBOARD';
    }
  | {
      kind: 'HOST' | 'USER';
      whiteboard: Whiteboard;
    };
export type WhiteboardMembership = WhiteboardMembershipState['kind'];

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
  status: WhiteboardMembershipState = { kind: 'NO_WHITEBOARD' };

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setupSocketListeners();
    this.on('message', msg => dispatch(msg, this));

    // TODO do proper handshake and select whiteboard
    if (countWhiteboards() == 0) {
      this.status = {
        kind: 'HOST',
        whiteboard: addWhiteboard(this, '00000000-0000-0000-0000-000000000000')
      };
    } else {
      connectClient(this, '00000000-0000-0000-0000-000000000000');
    }
  }

  public get whiteboard(): Whiteboard | null {
    if (this.status.kind == 'NO_WHITEBOARD') {
      return null;
    } else {
      return this.status.whiteboard;
    }
  }

  public setConnectedWhiteboard(whiteboard: Whiteboard) {
    this.status = { kind: 'USER', whiteboard };
  }

  private setupSocketListeners() {
    this.socket.on('message', (message: Uint8Array) => {
      // const decoded = decodeMessage(message as string);
      let decoded;
      try {
        decoded = ClientToServerMessage.decode(Reader.create(message));
        console.debug(`Decoded message:`, decoded.body?.$case);
      } catch (error) {
        console.warn('Error decoding message', error);
        return;
      }
      this.emit('message', decoded);
    });
    this.socket.on('close', () => {
      console.log('Client connection closed');
      this.emit('disconnect');
    });
  }

  public send(
    body: ServerToClientMessage['body'],
    previousMessageId?: string
  ): void {
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
