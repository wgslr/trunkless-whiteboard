export type Mode = "draw" | "erase";

export type Coordinate = {
  x: number;
  y: number;
}

type WireFormat = string;

export enum MessageCode {
  CREATE_WHITEBOARD = 'createWhiteboard',
  OPERATION_RESULT = 'operationResult',
  GET_ALL_REQ = 'getAllReq',
  GET_ALL_RESP = 'getAllResp'
}

export type Figure = {
  type: 'Note';
  location: Coordinate;
};

export class CreateWhiteboardMsg {
  readonly code = MessageCode.CREATE_WHITEBOARD;
}

export class OperationResultMsg {
  readonly code = MessageCode.OPERATION_RESULT;
  success: boolean = false;
}

export class GetAllReqMsg {
  readonly code = MessageCode.GET_ALL_REQ;
}

export class GetAllRespMsg {
  readonly code = MessageCode.GET_ALL_RESP;
  figures: Figure[] = [];
}

export type Message =
  | CreateWhiteboardMsg
  | OperationResultMsg
  | GetAllReqMsg
  | GetAllRespMsg;

export const decodeMessage = (messageData: WireFormat): Message => {
  // TODO change to protobuf
  const parsed = JSON.parse(messageData);
  if (!parsed.code || !Object.values(MessageCode).includes(parsed.code)) {
    console.warn('Invalid message received:', parsed);
    throw new Error('Invalid message received');
  }
  return parsed;
};

export const encode = (message: Message): WireFormat => JSON.stringify(message);