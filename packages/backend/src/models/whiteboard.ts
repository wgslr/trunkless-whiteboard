import { v4 as uuidv4 } from 'uuid';
import { encodeUUID as uuidStringToBytes } from '../encoding';
import {
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

export class Note extends Figure {
  type = FigureType.NOTE;
  id = uuidv4();
  content: string;
  constructor(coords: Coordinates, content?: string, id?: UUID) {
    super(id);
    this.location = coords;
    this.content = content ?? '';
  }
}

enum OperationType {
  FIGURE_MOVE,
  RETURN_ALL_FIGURES
}

type Operation =
  | {
      type: OperationType.FIGURE_MOVE;
      data: { figureId: UUID; newCoords: Coordinates };
    }
  | {
      type: OperationType.RETURN_ALL_FIGURES;
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
  figures: Map<Figure['id'], Figure> = new Map();

  constructor(host: ClientConnection) {
    this.id = uuidv4();
    this.host = host;
    this.clients = [host];

    // FIXME remove
    this.addNote({ x: 10, y: 20 });
  }

  handleOperation(op: Operation) {
    switch (op.type) {
      case OperationType.FIGURE_MOVE: {
        const { figureId, newCoords } = op.data;
        const figure = this.figures.get(figureId);
        if (!figure) {
          throw new OperationError('Figure does not exist');
        }
        if (
          newCoords.x < 0 ||
          newCoords.x > this.MAX_WIDTH ||
          newCoords.y < 0 ||
          newCoords.y > this.MAX_HEIGHT
        ) {
          throw new OperationError('New coords not allowed');
        }
        figure.location = newCoords;
        this.sendToClients({
          // @ts-ignore
          body: {
            $case: 'figureMoved',
            figureMoved: {
              figureId: uuidStringToBytes(figure.id),
              newCoordinates: newCoords
            }
          }
        });
        break;
      }
      // case OperationType.RETURN_ALL_FIGURES: {
      //   // FIXME send only to requester
      //   this.sendToClients(
      //     new GetAllRespMsg(Array.from(this.figures.values()))
      //   );
      // }
    }
  }

  protected sendToClients(message: ServerToClientMessage) {
    this.clients.forEach(client => {
      client.send(message);
    });
  }

  protected addNote(coords: Coordinates) {
    const figure = new Note(
      coords,
      `Note created at ${new Date().toISOString()}`
    );
    this.figures.set(figure.id, figure);
  }

  public addClientConnection(client: ClientConnection) {
    this.clients.push(client);
  }
}

const whiteboards: Map<Whiteboard['id'], Whiteboard> = new Map();

export const addWhiteboard = (host: ClientConnection) => {
  const board = new Whiteboard(host);
  whiteboards.set(board.id, board);
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