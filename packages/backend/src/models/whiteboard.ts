import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../types';
import type { User } from './user';
import { ClientConnection } from './client-connection';

abstract class Figure {
  id: UUID;
}

class Whiteboard {
  id: UUID;
  host: ClientConnection;
  figures: Map<Figure['id'], Figure> = new Map();

  constructor(host: ClientConnection) {
    this.id = uuidv4();
    this.host = host;
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
