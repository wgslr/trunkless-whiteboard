import { v4 as uuidv4 } from 'uuid';
import {
  encodeUUID,
  encodeUUID as uuidStringToBytes,
  noteToMessage,
  resultToMessage
} from '../encoding';
import {
  ClientToServerMessage,
  Coordinates,
  ErrorReason,
  FigureType,
  ServerToClientMessage
} from '../protocol/protocol';
import { Result, UUID } from '../types';
import { ClientConnection } from './client-connection';

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
export class Line {
  constructor(public id: UUID, public bitmap: Map<Coordinates, number>) {}
}

export enum OperationType {
  FIGURE_MOVE,
  LINE_ADD,
  NOTE_ADD,
  NOTE_UPADTE
}

export type Operation =
  | {
      type: OperationType.FIGURE_MOVE;
      data: { figureId: UUID; newCoords: Coordinates };
    }
  | {
      type: OperationType.LINE_ADD;
      data: { line: Line };
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
      // case OperationType.FIGURE_MOVE: {
      //   const { figureId, newCoords } = op.data;
      //   const figure = this.notes.get(figureId);
      //   if (!figure) {
      //     throw new OperationError('Figure does not exist');
      //   }
      //   if (
      //     newCoords.x < 0 ||
      //     newCoords.x > this.MAX_WIDTH ||
      //     newCoords.y < 0 ||
      //     newCoords.y > this.MAX_HEIGHT
      //   ) {
      //     throw new OperationError('New coords not allowed');
      //   }
      //   figure.location = newCoords;
      //   this.sendToClients({
      //     $case: 'figureMoved',
      //     figureMoved: {
      //       figureId: uuidStringToBytes(figure.id),
      //       newCoordinates: newCoords
      //     }
      //   });
      //   break;
      // }
      case OperationType.LINE_ADD: {
        const line = op.data.line;
        this.lines.set(line.id, line);

        console.log(`There are ${this.lines.size} lines on the whiteboard`);

        this.sendToClients({
          $case: 'lineDrawn',
          lineDrawn: {
            id: encodeUUID(line.id),
            bitmap: Array.from(line.bitmap.entries()).map(entry => ({
              coordinates: entry[0],
              value: entry[1]
            }))
          }
        });
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
      // case OperationType.RETURN_ALL_FIGURES: {
      //   // FIXME send only to requester
      //   this.sendToClients(
      //     new GetAllRespMsg(Array.from(this.notes.values()))
      //   );
      // }
    }
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
    client.whiteboard = this;
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
