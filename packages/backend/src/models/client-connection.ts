import { Reader } from 'protobufjs';
import { TypedEmitter } from 'tiny-typed-emitter';
import * as uuid from 'uuid';
import type * as WebSocket from 'ws';
import { dispatch } from '../controllers/router';
import {
  ClientToServerMessage,
  ServerToClientMessage
} from '../protocol/protocol';
import { UUID } from '../types';
import logger from '../lib/logger';
import { addWhiteboard, OperationType, Whiteboard } from './whiteboard';

let connections: ClientConnection[] = [];

declare interface ClientConnectionEvents {
  disconnect: () => void;
  // eslint-disable-next-line no-unused-vars
  message: (decoded: ClientToServerMessage) => void;
}

export type ClientFSM =
  | {
      state: 'ANONYMOUS';
    }
  | {
      state: 'NO_WHITEBOARD';
      username: string;
    }
  | {
      state: 'PENDING_APPROVAL';
      username: string;
      pendingWhiteboard: Whiteboard;
    }
  | {
      state: 'HOST' | 'USER';
      username: string;
      whiteboard: Whiteboard;
    };
export type ClientFSMState = ClientFSM['state'];

class IllegalStateTransition extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class ClientConnection extends TypedEmitter<ClientConnectionEvents> {
  id: UUID = uuid.v4();
  private _fsm: ClientFSM = { state: 'ANONYMOUS' };

  socket: WebSocket;

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    this.setupSocketListeners();
    this.on('message', msg => dispatch(msg, this));
    this.on('disconnect', () => this.leaveWhiteboard());
  }

  get fsm(): Readonly<ClientFSM> {
    return this._fsm;
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
      throw new IllegalStateTransition();
    }
    logger.info(`Client username set as: ${username}`);
    this._fsm = { state: 'NO_WHITEBOARD', username };
  }

  public get username(): string | null {
    return this._fsm.state === 'ANONYMOUS' ? null : this._fsm.username;
  }

  public requestJoinWhiteboard(whiteboard: Whiteboard): void {
    if (this._fsm.state !== 'NO_WHITEBOARD') {
      throw new IllegalStateTransition();
    }
    whiteboard.handleOperation(
      {
        type: OperationType.ADD_PENDING_CLIENT,
        data: { pendingClient: this }
      },
      this
    );
    this._fsm = {
      state: 'PENDING_APPROVAL',
      pendingWhiteboard: whiteboard,
      username: this._fsm.username
    };
  }

  public joinWhiteboard(whiteboard: Whiteboard): void {
    if (this._fsm.state !== 'PENDING_APPROVAL') {
      throw new IllegalStateTransition();
    }
    whiteboard.addClientConnection(this);
    this._fsm = { state: 'USER', whiteboard, username: this._fsm.username };
  }

  public handleJoinDenial(): void {
    if (this._fsm.state !== 'PENDING_APPROVAL') {
      throw new IllegalStateTransition();
    }
    this._fsm = { state: 'NO_WHITEBOARD', username: this._fsm.username };
  }

  public becomeHost(): Whiteboard {
    if (this._fsm.state !== 'NO_WHITEBOARD') {
      throw new IllegalStateTransition();
    }
    this._fsm = {
      state: 'HOST',
      whiteboard: addWhiteboard(this),
      username: this._fsm.username
    };
    return this._fsm.whiteboard;
  }

  public leaveWhiteboard(): void {
    if (this._fsm.state === 'USER') {
      this._fsm.whiteboard.detachClient(this);
    }
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
      messageId: uuid.v4(),
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
