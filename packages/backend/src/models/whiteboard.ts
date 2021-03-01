import { v4 as uuidv4 } from 'uuid';
import { Coordinates, FigureMovedMsg, FigureType, Message } from '../api';
import { UUID } from '../types';
import { ClientConnection } from './client-connection';

export abstract class Figure {
  id: UUID;
  type: FigureType;
  location: Coordinates;
}

enum OperationType {
  FIGURE_MOVE
}

type Operation = {
  type: OperationType.FIGURE_MOVE;
  data: { figureId: UUID; newCoords: Coordinates };
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
        this.sendToClients(new FigureMovedMsg(figure.id, newCoords));
        break;
      }
    }
  }

  protected sendToClients(message: Message) {
    this.clients.forEach(client => {
      client.send(message);
    });
  }
}

const whiteboards: Map<Whiteboard['id'], Whiteboard> = new Map();

export const addWhiteboard = (host: ClientConnection) => {
  const board = new Whiteboard(host);
  whiteboards.set(board.id, board);
  return board;
};

export const countWhiteboards = () => whiteboards.size;

// setInterval(() => {
//   console.log(`There are ${countWhiteboards()} whiteboards`, whiteboards);
// }, 2000);
