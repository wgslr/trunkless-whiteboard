import { v4 as uuidv4 } from 'uuid';
import { noteToMessage, resultToMessage } from '../encoding';
import { encodeUUID } from 'encoding';
import {
  ClientToServerMessage,
  Coordinates,
  ErrorReason,
  FigureType,
  ServerToClientMessage
} from '../protocol/protocol';
import { Result, UUID } from '../types';
import { ClientConnection } from './client-connection';
import * as R from 'ramda';

export abstract class Figure {
  id: UUID;
  type: FigureType;
  location: Coordinates;

  constructor(id?: UUID) {
    this.id = id || uuidv4();
  }
}

export type Note = {
  id: UUID;
  position: Coordinates;
  text: string;
};

export type Line = {
  id: UUID;
  points: Coordinates[];
};

export type LinePatch = Line;

export enum OperationType {
  FIGURE_MOVE,
  LINE_CREATE,
  LINE_ADD_POINTS,
  NOTE_ADD,
  NOTE_UPADTE,
  NOTE_DELETE
}

export type Operation =
  | {
      type: OperationType.FIGURE_MOVE;
      data: { figureId: UUID; newCoords: Coordinates };
    }
  | {
      type: OperationType.LINE_CREATE;
      data: { line: Line; causedBy: ClientToServerMessage['messsageId'] };
    }
  | {
      type: OperationType.LINE_ADD_POINTS;
      data: {
        change: LinePatch;
        causedBy: ClientToServerMessage['messsageId'];
      };
    }
  | {
      type: OperationType.NOTE_ADD;
      data: { note: Note; causedBy: ClientToServerMessage['messsageId'] };
    }
  | {
      type: OperationType.NOTE_UPADTE;
      data: {
        change: Partial<Note> & Pick<Note, 'id'>;
        causedBy: ClientToServerMessage['messsageId'];
      };
    }
  | {
      type: OperationType.NOTE_DELETE;
      data: {
        noteId: Note['id'];
        causedBy: ClientToServerMessage['messsageId'];
      };
    };

class OperationError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class Whiteboard {
  MAX_WIDTH = 400;
  MAX_HEIGHT = 400;
  id: UUID;
  host: ClientConnection;
  clients: ClientConnection[];
  notes: Map<Note['id'], Note> = new Map();
  lines: Map<Line['id'], Line> = new Map();

  constructor(host: ClientConnection, id?: UUID) {
    this.id = id ?? uuidv4();
    this.host = host;
    this.clients = [host];
  }

  handleOperation(op: Operation, client: ClientConnection) {
    switch (op.type) {
      case OperationType.LINE_CREATE: {
        const { line, causedBy } = op.data;
        this.lines.set(line.id, {
          id: line.id,
          points: R.uniq(line.points)
        });

        console.log(`There are ${this.lines.size} lines on the whiteboard`);

        this.sendToClients(
          {
            $case: 'lineCreatedOrUpdated',
            lineCreatedOrUpdated: {
              line: {
                id: encodeUUID(line.id),
                points: this.removeInvalidCoords(line.points)
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

        line.points = R.union(
          line.points,
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
      case OperationType.NOTE_ADD: {
        // TODO validate unique id
        const { note, causedBy } = op.data;
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
          console.log('Added note', note);
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
          position: change.position ?? note.position,
          text: change.text ?? note.text
        };

        this.notes.set(note.id, updated);
        console.log('Updated note', { old: note, updated });
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
      // case OperationType.RETURN_ALL_FIGURES: {
      //   // FIXME send only to requester
      //   this.sendToClients(
      //     new GetAllRespMsg(Array.from(this.notes.values()))
      //   );
      // }
    }
  }

  private removeInvalidCoords(coordList: Coordinates[]): Coordinates[] {
    return coordList;
    return coordList.filter(c => this.areCoordsWithinBounds(c));
  }

  private areCoordsWithinBounds(coords: Coordinates): boolean {
    console.log(coords);
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
    console.log(`Sending message to ${this.clients.length} clients:`, message);
    this.clients.forEach(client => {
      client.send(message, previousMessageId);
    });
  }

  public addClientConnection(client: ClientConnection) {
    this.clients.push(client);
    client.setConnectedWhiteboard(this);
    console.log('Client joined whiteboard', this.id);
  }
}

const whiteboards: Map<Whiteboard['id'], Whiteboard> = new Map();

export const addWhiteboard = (host: ClientConnection, uuid?: UUID) => {
  const board = new Whiteboard(host, uuid);
  whiteboards.set(board.id, board);
  console.log('Whiteboard created', board);
  return board;
};

export const countWhiteboards = () => whiteboards.size;

export const connectClient = (
  client: ClientConnection,
  whiteboardId: UUID
): Result => {
  const board = whiteboards.get(whiteboardId);
  if (board === undefined) {
    // TODO decouple from the protobuf error format, define internal Result interface
    return {
      result: 'error',
      reason: ErrorReason.WHITEBOARD_DOES_NOT_EXIST
    };
  } else {
    board.addClientConnection(client);
    return { result: 'success' };
  }
};

// setInterval(() => {
//   console.log(`There are ${countWhiteboards()} whiteboards`, whiteboards);
// }, 2000);
