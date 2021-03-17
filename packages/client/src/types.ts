import { v4 as uuidv4 } from 'uuid';
import { Coordinates } from './protocol/protocol';

export type { Coordinates } from './protocol/protocol';

export type CoordNumber = number;

export type UUID = ReturnType<typeof uuidv4>;

export type MessageId = UUID;

export type Mode = 'draw' | 'erase' | 'note';

export type Action =
  | {
      type: 'draw';
      id: UUID;
    }
  | {
      type: 'erase';
      lines: Map<UUID, CoordNumber[]>;
    };

export type Line = {
  id: UUID;
  points: CoordNumber[];
};

export type Note = {
  id: UUID;
  position: Coordinates;
  text: string;
};

export type Img = {
  id: UUID;
  position: Coordinates;
  data: string; // ts img object?
};

export enum MessageCode {
  CREATE_WHITEBOARD = 'createWhiteboard',
  OPERATION_RESULT = 'operationResult',
  GET_ALL_REQ = 'getAllReq',
  GET_ALL_RESP = 'getAllResp'
}

export class CreateWhiteboardMsg {
  readonly code = MessageCode.CREATE_WHITEBOARD;
}

export class OperationResultMsg {
  readonly code = MessageCode.OPERATION_RESULT;
  success: boolean = false;
}

export type Message = CreateWhiteboardMsg | OperationResultMsg;
