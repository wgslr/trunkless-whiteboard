import type { v4 as uuidv4 } from 'uuid';
import type { ErrorReason } from './protocol/protocol';

export type UUID = ReturnType<typeof uuidv4>;

export type Result =
  | { result: 'error'; reason: ErrorReason }
  | { result: 'success' };
