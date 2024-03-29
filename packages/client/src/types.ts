import { v4 as uuidv4 } from 'uuid';
import { Coordinates } from './protocol/protocol';

export type { Coordinates } from './protocol/protocol';

export type CoordNumber = number;

export type UUID = ReturnType<typeof uuidv4>;

export type MessageId = UUID;

export type Mode = 'none' | 'draw' | 'erase' | 'note' | 'image';

export type Line = {
  id: UUID;
  points: Set<CoordNumber>;
};

export type Note = {
  id: UUID;
  position: Coordinates;
  text: string;
  creatorId?: UUID;
};

export type Img = {
  id: UUID;
  position: Coordinates;
  data: Uint8Array; // ts img object?
  zIndex: number;
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
