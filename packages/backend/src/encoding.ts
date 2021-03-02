import { UUID } from './types';
import * as uuid from 'uuid';

export const encodeUUID = (id: UUID) => Uint8Array.from(uuid.parse(id));
