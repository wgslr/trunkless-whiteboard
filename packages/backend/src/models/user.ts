import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../types';

export class User {
  // TODO probably merge (or somehow relate to) ClientConnection

  id: UUID;
  constructor() {
    this.id = uuidv4();
  }
}
