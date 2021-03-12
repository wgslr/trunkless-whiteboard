import * as uuid from 'uuid';
import { Line, LineSequence, ServerToClientMessage } from './protocol/protocol';
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

export const messageToLine = (data: Line) => ({
  id: decodeUUID(data.id),
  bitmap: new Map(data.bitmap.map(point => [point.coordinates!, point.value]))
});

export const messageToLines = (data: LineSequence) => ({
  lines: data.lines.map(messageToLine)
});
