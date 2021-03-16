import * as uuid from 'uuid';
import type { v4 as uuidv4 } from 'uuid';

export type UUID = ReturnType<typeof uuidv4>;

export const encodeUUID = (id: UUID): Uint8Array =>
  Uint8Array.from(uuid.parse(id));

export const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);
