import * as uuid from 'uuid';
import { ServerToClientMessage } from './protocol/protocol';
import type { Result, UUID } from './types';

export const encodeUUID = (id: UUID): Uint8Array =>
  Uint8Array.from(uuid.parse(id));

export const decodeUUID = (id: Uint8Array): UUID => uuid.stringify(id);

export const resultToMessage = (result: Result): ServerToClientMessage => {
  if (result.result === 'success') {
    return { body: { $case: 'success', success: {} } };
  } else {
    return { body: { $case: 'error', error: { reason: result.reason } } };
  }
};
