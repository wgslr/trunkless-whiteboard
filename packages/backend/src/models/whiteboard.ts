import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../types';
import type { User } from './user';

abstract class Figure {
  id: UUID;
}

class Whiteboard {
  id: UUID;
  host: User;
  figures: Map<Figure['id'], Figure> = new Map();

  constructor(host: User) {
    this.id = uuidv4();
    this.host = host;
  }
}

const whitebords: Map<Whiteboard['id'], Whiteboard> = new Map();

export const addWhiteboard = (host: User) => {
  const board = new Whiteboard(host);
  whitebords.set(board.id, board);
  return board;
};
