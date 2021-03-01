import type * as WebSocket from 'ws';
import { Whiteboard, Figure as FigureModel } from './models/whiteboard';
import { UUID } from './types';

export enum MessageCode {
  CREATE_WHITEBOARD = 'createWhiteboard',
  OPERATION_RESULT = 'operationResult',
  GET_ALL_REQ = 'getAllReq',
  GET_ALL_RESP = 'getAllResp',
  FIGURE_MOVED = 'figureMoved'
}

type WireFormat = string;

export type Coordinates = { x: number; y: number };

// TODO probably deduplicate with typedefs from Models

export enum FigureType {
  NOTE = 'Note',
  LINE = 'Line',
  IMAGE = 'Image'
}

export type Figure = {
  id: UUID;
  type: FigureType.NOTE;
  location: Coordinates;
};

export class CreateWhiteboardMsg {
  readonly code = MessageCode.CREATE_WHITEBOARD;
}

export class OperationResultMsg {
  readonly code = MessageCode.OPERATION_RESULT;
  success: boolean;
}

export class GetAllReqMsg {
  readonly code = MessageCode.GET_ALL_REQ;
}

export class GetAllRespMsg {
  readonly code = MessageCode.GET_ALL_RESP;
  public figures: Figure[];
  constructor(figures: FigureModel[]) {
    this.figures = figures.map(f => ({ ...f, type: FigureType.NOTE }));
  }
}

export class FigureMovedMsg {
  readonly code = MessageCode.FIGURE_MOVED;
  constructor(public figureId: Figure['id'], public newCoords: Coordinates) {}
}

export type Message =
  | CreateWhiteboardMsg
  | OperationResultMsg
  | GetAllReqMsg
  | GetAllRespMsg
  | FigureMovedMsg;

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
