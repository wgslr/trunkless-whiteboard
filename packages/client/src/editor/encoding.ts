import * as uuid from 'uuid';
import type { UUID } from '../types';

export const encodeUUID = (id: UUID): Uint8Array =>
  Uint8Array.from(uuid.parse(id));

export const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);
