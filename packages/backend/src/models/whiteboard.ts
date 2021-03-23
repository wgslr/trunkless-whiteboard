/* eslint-disable no-unused-vars */
import { encodeUUID } from 'encoding';
import fp from 'lodash/fp';
import { v4 as uuidv4 } from 'uuid';
import {
  imageToMessage,
  makeErrorMessage,
  noteToMessage,
  resultToMessage
} from '../encoding';
import logger from '../lib/logger';
import {
  ClientToServerMessage,
  Coordinates,
  ErrorReason,
  ServerToClientMessage
} from '../protocol/protocol';
import { UUID } from '../types';
import { ClientConnection, ClientFSM } from './client-connection';

export type Note = {
  id: UUID;
  position: Coordinates;
  text: string;
  creatorId?: UUID;
};

export type Img = {
  id: UUID;
  position: Coordinates;
  data: Uint8Array;
  zIndex?: number;
};

export type Line = {
  id: UUID;
  points: Coordinates[];
};

export type User = {
  id: UUID;
  username: string;
};

export type LinePatch = Line;

/* eslint-disable-next-line no-shadow */
export enum OperationType {
  FIGURE_MOVE,
  LINE_CREATE,
  LINE_ADD_POINTS,
  LINE_REMOVE_POINTS,
  LINE_DELETE,
  NOTE_ADD,
  NOTE_UPADTE,
  NOTE_MOVE,
  NOTE_DELETE,
  IMG_ADD,
  ADD_PENDING_CLIENT,
  APPROVE_PENDING_CLIENT,
  DENY_PENDING_CLIENT
}

export type Operation =
  | {
      type: OperationType.FIGURE_MOVE;
      data: { figureId: UUID; newCoords: Coordinates };
    }
  | {
      type: OperationType.LINE_CREATE;
      data: { line: Line; causedBy: ClientToServerMessage['messageId'] };
    }
  | {
      type: OperationType.LINE_ADD_POINTS;
      data: {
        change: LinePatch;
        causedBy: ClientToServerMessage['messageId'];
      };
    }
  | {
      type: OperationType.LINE_REMOVE_POINTS;
      data: {
        change: LinePatch;
        causedBy: ClientToServerMessage['messageId'];
      };
    }
  | {
      type: OperationType.LINE_DELETE;
      data: {
        lineId: Line['id'];
        causedBy: ClientToServerMessage['messageId'];
      };
    }
  | {
      type: OperationType.NOTE_ADD;
      data: { note: Note; causedBy: ClientToServerMessage['messageId'] };
    }
  | {
      type: OperationType.NOTE_UPADTE;
      data: {
        change: Pick<Note, 'id' | 'text'>;
        causedBy: ClientToServerMessage['messageId'];
      };
    }
  | {
      type: OperationType.NOTE_MOVE;
      data: {
        change: Pick<Note, 'id' | 'position'>;
        causedBy: ClientToServerMessage['messageId'];
      };
    }
  | {
      type: OperationType.NOTE_DELETE;
      data: {
        noteId: Note['id'];
        causedBy: ClientToServerMessage['messageId'];
      };
    }
  | {
      type: OperationType.ADD_PENDING_CLIENT;
      data: {
        pendingClient: ClientConnection;
      };
    }
  | {
      type: OperationType.APPROVE_PENDING_CLIENT;
      data: {
        approvedClient: ClientConnection;
      };
    }
  | {
      type: OperationType.DENY_PENDING_CLIENT;
      data: {
        deniedClient: ClientConnection;
      };
    }
  | {
      type: OperationType.IMG_ADD;
      data: {
        img: Img;
        causedBy: ClientToServerMessage['messageId'];
      };
    };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class OperationError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

const coordToNumber = (coord: Coordinates) => coord.x * 1000000 + coord.y;

export class Whiteboard {
  MAX_WIDTH = 800;
  MAX_HEIGHT = 600;
  id: UUID;
  host: ClientConnection;
  clients: ClientConnection[] = [];
  pastUsers: User[] = [];
  pendingClients: Map<ClientConnection['id'], ClientConnection> = new Map();
  notes: Map<Note['id'], Note> = new Map();
  lines: Map<Line['id'], Line> = new Map();
  images: Map<Img['id'], Img> = new Map();
  ended: boolean = false;

  constructor(host: ClientConnection, id?: UUID) {
    this.id = id ?? uuidv4();
    this.host = host;
    this.clients = [host];
  }

  handleOperation(op: Operation, client: ClientConnection): void {
    if (this.ended) {
      logger.error(`Ended whiteboard session cannot handleOperation`);
      client.send(makeErrorMessage(ErrorReason.WHITEBOARD_DOES_NOT_EXIST));
      return;
    }
    switch (op.type) {
      case OperationType.LINE_CREATE: {
        const { line, causedBy } = op.data;
        if (this.lines.has(line.id)) {
          client.send(
            makeErrorMessage(ErrorReason.ID_CONFLICT),
            op.data.causedBy
          );
          return;
        }
        const sanitizedLine = {
          id: line.id,
          points: this.removeInvalidCoords(line.points)
        };
        this.lines.set(line.id, sanitizedLine);

        this.sendToClients(
          {
            $case: 'lineCreatedOrUpdated',
            lineCreatedOrUpdated: {
              line: {
                id: encodeUUID(sanitizedLine.id),
                points: sanitizedLine.points
              }
            }
          },
          causedBy
        );
        break;
      }
      case OperationType.LINE_ADD_POINTS: {
        const { change: patch, causedBy } = op.data;
        const line = this.lines.get(patch.id);
        if (!line) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.FIGURE_NOT_EXISTS
            }),
            causedBy
          );
          return;
        }

        line.points = line.points.concat(
          this.removeInvalidCoords(patch.points)
        );

        this.sendToClients(
          {
            $case: 'lineCreatedOrUpdated',
            lineCreatedOrUpdated: {
              line: {
                id: encodeUUID(line.id),
                points: line.points
              }
            }
          },
          causedBy
        );
        break;
      }
      case OperationType.LINE_REMOVE_POINTS: {
        const { change: patch, causedBy } = op.data;
        const line = this.lines.get(patch.id);
        if (!line) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.FIGURE_NOT_EXISTS
            }),
            causedBy
          );
          return;
        }

        const newLinePoints = fp.differenceBy(
          coordToNumber,
          line.points,
          patch.points
        );
        const removedPoints = line.points.length - newLinePoints.length;
        logger.info(`Removed points: ${removedPoints}`);
        if (removedPoints > 0) {
          line.points = newLinePoints;
          this.sendToClients(
            {
              $case: 'lineCreatedOrUpdated',
              lineCreatedOrUpdated: {
                line: {
                  id: encodeUUID(line.id),
                  points: line.points
                }
              }
            },
            causedBy
          );
        } else {
          // TODO maybe send error response about no-operation
        }
        break;
      }
      case OperationType.LINE_DELETE: {
        const { lineId, causedBy } = op.data;
        const line = this.lines.get(lineId);
        if (!line) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.FIGURE_NOT_EXISTS
            }),
            causedBy
          );
          return;
        } else {
          this.lines.delete(lineId);
          this.sendToClients(
            {
              $case: 'lineDeleted',
              lineDeleted: { lineId: encodeUUID(lineId) }
            },
            causedBy
          );
        }
        break;
      }
      case OperationType.NOTE_ADD: {
        // TODO validate unique id
        const { note: noteData, causedBy } = op.data;
        if (this.notes.has(noteData.id)) {
          client.send(
            makeErrorMessage(ErrorReason.ID_CONFLICT),
            op.data.causedBy
          );
          return;
        }
        const note: Note = {
          ...noteData,
          creatorId: client.id
        };
        if (!this.areCoordsWithinBounds(note.position)) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.COORDINATES_OUT_OF_BOUNDS
            }),
            causedBy
          );
        } else {
          this.notes.set(note.id, note);
          this.sendToClients(
            {
              $case: 'noteCreatedOrUpdated',
              noteCreatedOrUpdated: {
                note: noteToMessage(note)
              }
            },
            causedBy
          );
        }
        break;
      }
      case OperationType.NOTE_UPADTE: {
        const { change, causedBy } = op.data;
        const note = this.notes.get(change.id);
        if (!note) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.FIGURE_NOT_EXISTS
            }),
            causedBy
          );
          return;
        }
        const updated = {
          ...note,
          text: change.text
        };

        this.notes.set(note.id, updated);
        this.sendToClients(
          {
            $case: 'noteCreatedOrUpdated',
            noteCreatedOrUpdated: {
              note: noteToMessage(updated)
            }
          },
          causedBy
        );

        break;
      }
      case OperationType.NOTE_DELETE: {
        const { noteId, causedBy } = op.data;
        if (this.notes.has(noteId)) {
          this.notes.delete(noteId);
          this.sendToClients(
            {
              $case: 'noteDeleted',
              noteDeleted: {
                noteId: encodeUUID(noteId)
              }
            },
            causedBy
          );
        } else {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.FIGURE_NOT_EXISTS
            }),
            causedBy
          );
        }
        break;
      }
      case OperationType.NOTE_MOVE: {
        const { change, causedBy } = op.data;
        if (change.position && !this.areCoordsWithinBounds(change.position)) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.COORDINATES_OUT_OF_BOUNDS
            }),
            causedBy
          );
          return;
        }
        const note = this.notes.get(change.id);
        if (!note) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.FIGURE_NOT_EXISTS
            }),
            causedBy
          );
          return;
        }
        const updated = {
          ...note,
          position: change.position ?? note.position
        };

        this.notes.set(note.id, updated);
        this.sendToClients(
          {
            $case: 'noteCreatedOrUpdated',
            noteCreatedOrUpdated: {
              note: noteToMessage(updated)
            }
          },
          causedBy
        );

        break;
      }
      case OperationType.IMG_ADD: {
        const { img: imgData, causedBy } = op.data;
        if (this.images.has(imgData.id)) {
          client.send(
            makeErrorMessage(ErrorReason.ID_CONFLICT),
            op.data.causedBy
          );
          return;
        }
        const img: Img = {
          ...imgData,
          zIndex: this.images.size
        };
        if (!this.areCoordsWithinBounds(img.position)) {
          client.send(
            resultToMessage({
              result: 'error',
              reason: ErrorReason.COORDINATES_OUT_OF_BOUNDS
            }),
            causedBy
          );
        } else {
          this.images.set(img.id, img);
          this.sendToClients(
            {
              $case: 'imageCreated',
              imageCreated: {
                image: imageToMessage(img)
              }
            },
            causedBy
          );
        }
        break;
      }
      case OperationType.ADD_PENDING_CLIENT: {
        const { pendingClient } = op.data;
        this.pendingClients.set(pendingClient.id, pendingClient);
        if (pendingClient.fsm.state !== 'NO_WHITEBOARD') {
          throw new Error('Invalid client state');
        }
        this.host.send({
          $case: 'clientWantsToJoin',
          clientWantsToJoin: {
            clientId: encodeUUID(pendingClient.id),
            username: pendingClient.fsm.username
          }
        });
        break;
      }
      case OperationType.APPROVE_PENDING_CLIENT: {
        const { approvedClient } = op.data;
        if (approvedClient.fsm.state !== 'PENDING_APPROVAL') {
          throw new Error('Invalid client state');
        }
        const clientWasPending = this.pendingClients.delete(approvedClient.id);
        if (!clientWasPending) {
          throw new Error(
            `Client ${approvedClient.id} was not pending for whiteboard ${this.id}`
          );
        }

        approvedClient.joinWhiteboard(this);
        approvedClient.send({
          $case: 'joinApproved',
          joinApproved: {}
        });

        this.sendCurrentClientList();
        this.bootstrapClient(approvedClient);
        break;
      }
      case OperationType.DENY_PENDING_CLIENT: {
        const { deniedClient } = op.data;
        const deniedClientConnection = this.pendingClients.get(deniedClient.id);
        if (!deniedClientConnection) {
          throw new Error(
            `Client ${deniedClient.id} was not pending for whiteboard ${this.id}`
          );
        }
        deniedClientConnection.handleJoinDenial();

        this.pendingClients.delete(deniedClient.id);
        deniedClient.send({
          $case: 'joinDenied',
          joinDenied: {}
        });
        break;
      }
    }
  }

  public sendCurrentClientList = () => {
    this.sendToClients({
      $case: 'userListChanged',
      userListChanged: {
        present: this.clients.map(userClient => ({
          username: userClient.username!,
          clientId: encodeUUID(userClient.id)
        })),
        past: this.pastUsers.map(u => ({
          username: u.username,
          clientId: encodeUUID(u.id)
        }))
      }
    });
  };

  public detachClient = (client: ClientConnection) => {
    this.clients = this.clients.filter(c => c !== client);
    const clientFSM = client.fsm as Extract<
      ClientFSM,
      { whiteboard: Whiteboard }
    >;
    this.pastUsers.push({
      id: client.id,
      username: clientFSM.username
    });
    this.sendCurrentClientList();
  };

  public endSession = () => {
    logger.info(`Ending session of whiteboard ${this.id}`);
    this.sendToClients({
      $case: 'whiteboardSessionEnded',
      whiteboardSessionEnded: {}
    });
    this.clients.forEach(c => c.handleWhiteboardEndedByHost());
    this.ended = true;
  };

  private removeInvalidCoords(coordList: Coordinates[]): Coordinates[] {
    return coordList.filter(c => this.areCoordsWithinBounds(c));
  }

  private areCoordsWithinBounds(coords: Coordinates): boolean {
    return (
      coords.x >= 0 &&
      coords.x <= this.MAX_WIDTH &&
      coords.y >= 0 &&
      coords.y <= this.MAX_HEIGHT
    );
  }

  protected sendToClients(
    message: ServerToClientMessage['body'],
    previousMessageId?: string
  ) {
    if (this.ended) {
      return;
    }
    logger.debug(
      `Sending message to ${this.clients.length} clients: ${message?.$case}`
    );
    this.clients.forEach(client => {
      client.send(message, previousMessageId);
    });
  }

  public addClientConnection(client: ClientConnection) {
    this.clients.push(client);
    logger.info(`Client joined whiteboard: ${this.id}`);
  }

  public bootstrapClient(client: ClientConnection) {
    for (const [, line] of this.lines) {
      client.send({
        $case: 'lineCreatedOrUpdated',
        lineCreatedOrUpdated: {
          line: {
            id: encodeUUID(line.id),
            points: line.points
          }
        }
      });
    }
    for (const [, note] of this.notes) {
      client.send({
        $case: 'noteCreatedOrUpdated',
        noteCreatedOrUpdated: {
          note: noteToMessage(note)
        }
      });
    }
    for (const [, img] of this.images) {
      client.send({
        $case: 'imageCreated',
        imageCreated: {
          image: imageToMessage(img)
        }
      });
    }
  }

  public getPendingClient(clientId: ClientConnection['id']) {
    return this.pendingClients.get(clientId) ?? null;
  }
}

const whiteboards: Map<Whiteboard['id'], Whiteboard> = new Map();

export const addWhiteboard = (host: ClientConnection, uuid?: UUID) => {
  const board = new Whiteboard(host, uuid);
  whiteboards.set(board.id, board);
  logger.info(`Whiteboard created: ${board.id}`);
  return board;
};

export const countWhiteboards = () => whiteboards.size;

export const getWhiteboard = (id: Whiteboard['id']): Whiteboard | null =>
  whiteboards.get(id) ?? null;

export const endSession = (whiteboard: Whiteboard) => {
  whiteboard.endSession();
  whiteboards.delete(whiteboard.id);
};
