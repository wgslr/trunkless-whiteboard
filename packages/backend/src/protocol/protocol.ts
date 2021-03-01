/* eslint-disable */
import _m0 from 'protobufjs/minimal';

export const protobufPackage = '';

export enum FigureType {
  NOTE = 0,
  LINE = 1,
  IMAGE = 2,
  UNRECOGNIZED = -1
}

export function figureTypeFromJSON(object: any): FigureType {
  switch (object) {
    case 0:
    case 'NOTE':
      return FigureType.NOTE;
    case 1:
    case 'LINE':
      return FigureType.LINE;
    case 2:
    case 'IMAGE':
      return FigureType.IMAGE;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return FigureType.UNRECOGNIZED;
  }
}

export function figureTypeToJSON(object: FigureType): string {
  switch (object) {
    case FigureType.NOTE:
      return 'NOTE';
    case FigureType.LINE:
      return 'LINE';
    case FigureType.IMAGE:
      return 'IMAGE';
    default:
      return 'UNKNOWN';
  }
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Note {
  id: Uint8Array;
  coordinates: Coordinates | undefined;
  content: string;
}

export interface CreateWhiteboardRequest {}

export interface WhiteboardCreated {
  whiteboardId: string;
}

/**
 * Requests that the server sends
 * information about all figures present in a whiteboard.
 */
export interface GetAllFiguresRequest {}

/** Provides */
export interface GetAllFiguresResponse {
  notes: Note[];
}

export interface FigureMovedMsg {
  figureId: Uint8Array;
  newCoordinates: Coordinates | undefined;
}

export interface MessageWrapper {
  createWhiteboardRequest: CreateWhiteboardRequest | undefined;
  whiteboardCreated: WhiteboardCreated | undefined;
  getAllFiguresRequest: GetAllFiguresRequest | undefined;
  getAllFiguresResponse: GetAllFiguresResponse | undefined;
  figureMovedMsg: FigureMovedMsg | undefined;
}

const baseCoordinates: object = { x: 0, y: 0 };

export const Coordinates = {
  encode(
    message: Coordinates,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.x !== 0) {
      writer.uint32(8).int32(message.x);
    }
    if (message.y !== 0) {
      writer.uint32(16).int32(message.y);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Coordinates {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCoordinates } as Coordinates;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.x = reader.int32();
          break;
        case 2:
          message.y = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Coordinates {
    const message = { ...baseCoordinates } as Coordinates;
    if (object.x !== undefined && object.x !== null) {
      message.x = Number(object.x);
    } else {
      message.x = 0;
    }
    if (object.y !== undefined && object.y !== null) {
      message.y = Number(object.y);
    } else {
      message.y = 0;
    }
    return message;
  },

  toJSON(message: Coordinates): unknown {
    const obj: any = {};
    message.x !== undefined && (obj.x = message.x);
    message.y !== undefined && (obj.y = message.y);
    return obj;
  },

  fromPartial(object: DeepPartial<Coordinates>): Coordinates {
    const message = { ...baseCoordinates } as Coordinates;
    if (object.x !== undefined && object.x !== null) {
      message.x = object.x;
    } else {
      message.x = 0;
    }
    if (object.y !== undefined && object.y !== null) {
      message.y = object.y;
    } else {
      message.y = 0;
    }
    return message;
  }
};

const baseNote: object = { content: '' };

export const Note = {
  encode(message: Note, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id.length !== 0) {
      writer.uint32(10).bytes(message.id);
    }
    if (message.coordinates !== undefined) {
      Coordinates.encode(
        message.coordinates,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.content !== '') {
      writer.uint32(26).string(message.content);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Note {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNote } as Note;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.bytes();
          break;
        case 2:
          message.coordinates = Coordinates.decode(reader, reader.uint32());
          break;
        case 3:
          message.content = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Note {
    const message = { ...baseNote } as Note;
    if (object.id !== undefined && object.id !== null) {
      message.id = bytesFromBase64(object.id);
    }
    if (object.coordinates !== undefined && object.coordinates !== null) {
      message.coordinates = Coordinates.fromJSON(object.coordinates);
    } else {
      message.coordinates = undefined;
    }
    if (object.content !== undefined && object.content !== null) {
      message.content = String(object.content);
    } else {
      message.content = '';
    }
    return message;
  },

  toJSON(message: Note): unknown {
    const obj: any = {};
    message.id !== undefined &&
      (obj.id = base64FromBytes(
        message.id !== undefined ? message.id : new Uint8Array()
      ));
    message.coordinates !== undefined &&
      (obj.coordinates = message.coordinates
        ? Coordinates.toJSON(message.coordinates)
        : undefined);
    message.content !== undefined && (obj.content = message.content);
    return obj;
  },

  fromPartial(object: DeepPartial<Note>): Note {
    const message = { ...baseNote } as Note;
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    } else {
      message.id = new Uint8Array();
    }
    if (object.coordinates !== undefined && object.coordinates !== null) {
      message.coordinates = Coordinates.fromPartial(object.coordinates);
    } else {
      message.coordinates = undefined;
    }
    if (object.content !== undefined && object.content !== null) {
      message.content = object.content;
    } else {
      message.content = '';
    }
    return message;
  }
};

const baseCreateWhiteboardRequest: object = {};

export const CreateWhiteboardRequest = {
  encode(
    _: CreateWhiteboardRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateWhiteboardRequest {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseCreateWhiteboardRequest
    } as CreateWhiteboardRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): CreateWhiteboardRequest {
    const message = {
      ...baseCreateWhiteboardRequest
    } as CreateWhiteboardRequest;
    return message;
  },

  toJSON(_: CreateWhiteboardRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(
    _: DeepPartial<CreateWhiteboardRequest>
  ): CreateWhiteboardRequest {
    const message = {
      ...baseCreateWhiteboardRequest
    } as CreateWhiteboardRequest;
    return message;
  }
};

const baseWhiteboardCreated: object = { whiteboardId: '' };

export const WhiteboardCreated = {
  encode(
    message: WhiteboardCreated,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.whiteboardId !== '') {
      writer.uint32(10).string(message.whiteboardId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WhiteboardCreated {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseWhiteboardCreated } as WhiteboardCreated;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.whiteboardId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WhiteboardCreated {
    const message = { ...baseWhiteboardCreated } as WhiteboardCreated;
    if (object.whiteboardId !== undefined && object.whiteboardId !== null) {
      message.whiteboardId = String(object.whiteboardId);
    } else {
      message.whiteboardId = '';
    }
    return message;
  },

  toJSON(message: WhiteboardCreated): unknown {
    const obj: any = {};
    message.whiteboardId !== undefined &&
      (obj.whiteboardId = message.whiteboardId);
    return obj;
  },

  fromPartial(object: DeepPartial<WhiteboardCreated>): WhiteboardCreated {
    const message = { ...baseWhiteboardCreated } as WhiteboardCreated;
    if (object.whiteboardId !== undefined && object.whiteboardId !== null) {
      message.whiteboardId = object.whiteboardId;
    } else {
      message.whiteboardId = '';
    }
    return message;
  }
};

const baseGetAllFiguresRequest: object = {};

export const GetAllFiguresRequest = {
  encode(
    _: GetAllFiguresRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GetAllFiguresRequest {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGetAllFiguresRequest } as GetAllFiguresRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): GetAllFiguresRequest {
    const message = { ...baseGetAllFiguresRequest } as GetAllFiguresRequest;
    return message;
  },

  toJSON(_: GetAllFiguresRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<GetAllFiguresRequest>): GetAllFiguresRequest {
    const message = { ...baseGetAllFiguresRequest } as GetAllFiguresRequest;
    return message;
  }
};

const baseGetAllFiguresResponse: object = {};

export const GetAllFiguresResponse = {
  encode(
    message: GetAllFiguresResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.notes) {
      Note.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GetAllFiguresResponse {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGetAllFiguresResponse } as GetAllFiguresResponse;
    message.notes = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.notes.push(Note.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetAllFiguresResponse {
    const message = { ...baseGetAllFiguresResponse } as GetAllFiguresResponse;
    message.notes = [];
    if (object.notes !== undefined && object.notes !== null) {
      for (const e of object.notes) {
        message.notes.push(Note.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: GetAllFiguresResponse): unknown {
    const obj: any = {};
    if (message.notes) {
      obj.notes = message.notes.map(e => (e ? Note.toJSON(e) : undefined));
    } else {
      obj.notes = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetAllFiguresResponse>
  ): GetAllFiguresResponse {
    const message = { ...baseGetAllFiguresResponse } as GetAllFiguresResponse;
    message.notes = [];
    if (object.notes !== undefined && object.notes !== null) {
      for (const e of object.notes) {
        message.notes.push(Note.fromPartial(e));
      }
    }
    return message;
  }
};

const baseFigureMovedMsg: object = {};

export const FigureMovedMsg = {
  encode(
    message: FigureMovedMsg,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.figureId.length !== 0) {
      writer.uint32(10).bytes(message.figureId);
    }
    if (message.newCoordinates !== undefined) {
      Coordinates.encode(
        message.newCoordinates,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FigureMovedMsg {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseFigureMovedMsg } as FigureMovedMsg;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.figureId = reader.bytes();
          break;
        case 2:
          message.newCoordinates = Coordinates.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FigureMovedMsg {
    const message = { ...baseFigureMovedMsg } as FigureMovedMsg;
    if (object.figureId !== undefined && object.figureId !== null) {
      message.figureId = bytesFromBase64(object.figureId);
    }
    if (object.newCoordinates !== undefined && object.newCoordinates !== null) {
      message.newCoordinates = Coordinates.fromJSON(object.newCoordinates);
    } else {
      message.newCoordinates = undefined;
    }
    return message;
  },

  toJSON(message: FigureMovedMsg): unknown {
    const obj: any = {};
    message.figureId !== undefined &&
      (obj.figureId = base64FromBytes(
        message.figureId !== undefined ? message.figureId : new Uint8Array()
      ));
    message.newCoordinates !== undefined &&
      (obj.newCoordinates = message.newCoordinates
        ? Coordinates.toJSON(message.newCoordinates)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<FigureMovedMsg>): FigureMovedMsg {
    const message = { ...baseFigureMovedMsg } as FigureMovedMsg;
    if (object.figureId !== undefined && object.figureId !== null) {
      message.figureId = object.figureId;
    } else {
      message.figureId = new Uint8Array();
    }
    if (object.newCoordinates !== undefined && object.newCoordinates !== null) {
      message.newCoordinates = Coordinates.fromPartial(object.newCoordinates);
    } else {
      message.newCoordinates = undefined;
    }
    return message;
  }
};

const baseMessageWrapper: object = {};

export const MessageWrapper = {
  encode(
    message: MessageWrapper,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.createWhiteboardRequest !== undefined) {
      CreateWhiteboardRequest.encode(
        message.createWhiteboardRequest,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.whiteboardCreated !== undefined) {
      WhiteboardCreated.encode(
        message.whiteboardCreated,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.getAllFiguresRequest !== undefined) {
      GetAllFiguresRequest.encode(
        message.getAllFiguresRequest,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.getAllFiguresResponse !== undefined) {
      GetAllFiguresResponse.encode(
        message.getAllFiguresResponse,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.figureMovedMsg !== undefined) {
      FigureMovedMsg.encode(
        message.figureMovedMsg,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MessageWrapper {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMessageWrapper } as MessageWrapper;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.createWhiteboardRequest = CreateWhiteboardRequest.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.whiteboardCreated = WhiteboardCreated.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.getAllFiguresRequest = GetAllFiguresRequest.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.getAllFiguresResponse = GetAllFiguresResponse.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.figureMovedMsg = FigureMovedMsg.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MessageWrapper {
    const message = { ...baseMessageWrapper } as MessageWrapper;
    if (
      object.createWhiteboardRequest !== undefined &&
      object.createWhiteboardRequest !== null
    ) {
      message.createWhiteboardRequest = CreateWhiteboardRequest.fromJSON(
        object.createWhiteboardRequest
      );
    } else {
      message.createWhiteboardRequest = undefined;
    }
    if (
      object.whiteboardCreated !== undefined &&
      object.whiteboardCreated !== null
    ) {
      message.whiteboardCreated = WhiteboardCreated.fromJSON(
        object.whiteboardCreated
      );
    } else {
      message.whiteboardCreated = undefined;
    }
    if (
      object.getAllFiguresRequest !== undefined &&
      object.getAllFiguresRequest !== null
    ) {
      message.getAllFiguresRequest = GetAllFiguresRequest.fromJSON(
        object.getAllFiguresRequest
      );
    } else {
      message.getAllFiguresRequest = undefined;
    }
    if (
      object.getAllFiguresResponse !== undefined &&
      object.getAllFiguresResponse !== null
    ) {
      message.getAllFiguresResponse = GetAllFiguresResponse.fromJSON(
        object.getAllFiguresResponse
      );
    } else {
      message.getAllFiguresResponse = undefined;
    }
    if (object.figureMovedMsg !== undefined && object.figureMovedMsg !== null) {
      message.figureMovedMsg = FigureMovedMsg.fromJSON(object.figureMovedMsg);
    } else {
      message.figureMovedMsg = undefined;
    }
    return message;
  },

  toJSON(message: MessageWrapper): unknown {
    const obj: any = {};
    message.createWhiteboardRequest !== undefined &&
      (obj.createWhiteboardRequest = message.createWhiteboardRequest
        ? CreateWhiteboardRequest.toJSON(message.createWhiteboardRequest)
        : undefined);
    message.whiteboardCreated !== undefined &&
      (obj.whiteboardCreated = message.whiteboardCreated
        ? WhiteboardCreated.toJSON(message.whiteboardCreated)
        : undefined);
    message.getAllFiguresRequest !== undefined &&
      (obj.getAllFiguresRequest = message.getAllFiguresRequest
        ? GetAllFiguresRequest.toJSON(message.getAllFiguresRequest)
        : undefined);
    message.getAllFiguresResponse !== undefined &&
      (obj.getAllFiguresResponse = message.getAllFiguresResponse
        ? GetAllFiguresResponse.toJSON(message.getAllFiguresResponse)
        : undefined);
    message.figureMovedMsg !== undefined &&
      (obj.figureMovedMsg = message.figureMovedMsg
        ? FigureMovedMsg.toJSON(message.figureMovedMsg)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MessageWrapper>): MessageWrapper {
    const message = { ...baseMessageWrapper } as MessageWrapper;
    if (
      object.createWhiteboardRequest !== undefined &&
      object.createWhiteboardRequest !== null
    ) {
      message.createWhiteboardRequest = CreateWhiteboardRequest.fromPartial(
        object.createWhiteboardRequest
      );
    } else {
      message.createWhiteboardRequest = undefined;
    }
    if (
      object.whiteboardCreated !== undefined &&
      object.whiteboardCreated !== null
    ) {
      message.whiteboardCreated = WhiteboardCreated.fromPartial(
        object.whiteboardCreated
      );
    } else {
      message.whiteboardCreated = undefined;
    }
    if (
      object.getAllFiguresRequest !== undefined &&
      object.getAllFiguresRequest !== null
    ) {
      message.getAllFiguresRequest = GetAllFiguresRequest.fromPartial(
        object.getAllFiguresRequest
      );
    } else {
      message.getAllFiguresRequest = undefined;
    }
    if (
      object.getAllFiguresResponse !== undefined &&
      object.getAllFiguresResponse !== null
    ) {
      message.getAllFiguresResponse = GetAllFiguresResponse.fromPartial(
        object.getAllFiguresResponse
      );
    } else {
      message.getAllFiguresResponse = undefined;
    }
    if (object.figureMovedMsg !== undefined && object.figureMovedMsg !== null) {
      message.figureMovedMsg = FigureMovedMsg.fromPartial(
        object.figureMovedMsg
      );
    } else {
      message.figureMovedMsg = undefined;
    }
    return message;
  }
};

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw 'Unable to locate global object';
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  (b64 => globalThis.Buffer.from(b64, 'base64').toString('binary'));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  (bin => globalThis.Buffer.from(bin, 'binary').toString('base64'));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  for (let i = 0; i < arr.byteLength; ++i) {
    bin.push(String.fromCharCode(arr[i]));
  }
  return btoa(bin.join(''));
}

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;
