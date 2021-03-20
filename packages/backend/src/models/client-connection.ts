import { Reader } from 'protobufjs';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import type * as WebSocket from 'ws';
import { dispatch } from '../controllers/router';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { addWhiteboard, Whiteboard } from './whiteboard';
import logger from '../lib/logger';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  // eslint-disable-next-line no-unused-vars
  message: (decoded: ClientToServerMessage) => void;
}

type ClientFSM =
  | {
      state: 'ANONYMOUS';
    }
  | {
      state: 'NO_WHITEBOARD';
      username: string;
    }
  | {
      state: 'HOST' | 'USER';
      username: string;
      whiteboard: Whiteboard;
    };
export type ClientFSMState = ClientFSM['state'];

class IllegalStateTransision extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  socket: WebSocket;
  private _fsm: ClientFSM = { state: 'ANONYMOUS' };

  get fsm(): Readonly<ClientFSM> {
    return this._fsm;
  }

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setupSocketListeners();
    this.on('message', msg => dispatch(msg, this));
  }

  public get whiteboard(): Whiteboard | null {
    if (this._fsm.state === 'USER' || this._fsm.state === 'HOST') {
      return this._fsm.whiteboard;
    } else {
      return null;
    }
  }

  public setUsername(username: string) {
    if (this._fsm.state !== 'ANONYMOUS') {
      throw new IllegalStateTransision();
    }
    logger.info(`Client username set as: ${username}`);
    this._fsm = { state: 'NO_WHITEBOARD', username };
  }

  public joinWhiteboard(whiteboard: Whiteboard): void {
    if (this._fsm.state !== 'NO_WHITEBOARD') {
      throw new IllegalStateTransision();
    }
    whiteboard.addClientConnection(this);
    this._fsm = { state: 'USER', whiteboard, username: this._fsm.username };
  }

  public becomeHost(): Whiteboard['id'] {
    if (this._fsm.state !== 'NO_WHITEBOARD') {
      throw new IllegalStateTransision();
    }
    this._fsm = {
      state: 'HOST',
      whiteboard: addWhiteboard(this),
      username: this._fsm.username
    };
    return this._fsm.whiteboard.id;
  }

  private setupSocketListeners() {
    this.socket.on('message', (message: Uint8Array) => {
      // const decoded = decodeMessage(message as string);
      let decoded;
      try {
        decoded = ClientToServerMessage.decode(Reader.create(message));
        logger.debug(`Decoded message: ${decoded.body?.$case}`);
      } catch (error) {
        logger.warn(`Error decoding message: ${error}`, error);
        return;
      }
      this.emit('message', decoded);
    });
    this.socket.on('close', () => {
      logger.info('Client connection closed');
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
