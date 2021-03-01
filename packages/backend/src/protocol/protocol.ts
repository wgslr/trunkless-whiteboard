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

export interface NoteData {
  content: string;
}

export interface LineData {
  bitmap: Uint8Array;
}

export interface Figure {
  lineData: LineData | undefined;
  noteData: NoteData | undefined;
}

export interface CreateWhiteboardRequest {}

export interface GetAllFiguresRequest {}

export interface GetAllFiguresResponse {
  figures: Figure[];
}

export interface MessageWrapper {
  createWhiteboardRequest: CreateWhiteboardRequest | undefined;
  getAllFiguresRequest: GetAllFiguresRequest | undefined;
  getAllFiguresResponse: GetAllFiguresResponse | undefined;
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

const baseNoteData: object = { content: '' };

export const NoteData = {
  encode(
    message: NoteData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.content !== '') {
      writer.uint32(10).string(message.content);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NoteData {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseNoteData } as NoteData;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.content = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): NoteData {
    const message = { ...baseNoteData } as NoteData;
    if (object.content !== undefined && object.content !== null) {
      message.content = String(object.content);
    } else {
      message.content = '';
    }
    return message;
  },

  toJSON(message: NoteData): unknown {
    const obj: any = {};
    message.content !== undefined && (obj.content = message.content);
    return obj;
  },

  fromPartial(object: DeepPartial<NoteData>): NoteData {
    const message = { ...baseNoteData } as NoteData;
    if (object.content !== undefined && object.content !== null) {
      message.content = object.content;
    } else {
      message.content = '';
    }
    return message;
  }
};

const baseLineData: object = {};

export const LineData = {
  encode(
    message: LineData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.bitmap.length !== 0) {
      writer.uint32(10).bytes(message.bitmap);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LineData {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseLineData } as LineData;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bitmap = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): LineData {
    const message = { ...baseLineData } as LineData;
    if (object.bitmap !== undefined && object.bitmap !== null) {
      message.bitmap = bytesFromBase64(object.bitmap);
    }
    return message;
  },

  toJSON(message: LineData): unknown {
    const obj: any = {};
    message.bitmap !== undefined &&
      (obj.bitmap = base64FromBytes(
        message.bitmap !== undefined ? message.bitmap : new Uint8Array()
      ));
    return obj;
  },

  fromPartial(object: DeepPartial<LineData>): LineData {
    const message = { ...baseLineData } as LineData;
    if (object.bitmap !== undefined && object.bitmap !== null) {
      message.bitmap = object.bitmap;
    } else {
      message.bitmap = new Uint8Array();
    }
    return message;
  }
};

const baseFigure: object = {};

export const Figure = {
  encode(
    message: Figure,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.lineData !== undefined) {
      LineData.encode(message.lineData, writer.uint32(26).fork()).ldelim();
    }
    if (message.noteData !== undefined) {
      NoteData.encode(message.noteData, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Figure {
    const reader = input instanceof Uint8Array ? new _m0.Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseFigure } as Figure;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          message.lineData = LineData.decode(reader, reader.uint32());
          break;
        case 4:
          message.noteData = NoteData.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Figure {
    const message = { ...baseFigure } as Figure;
    if (object.lineData !== undefined && object.lineData !== null) {
      message.lineData = LineData.fromJSON(object.lineData);
    } else {
      message.lineData = undefined;
    }
    if (object.noteData !== undefined && object.noteData !== null) {
      message.noteData = NoteData.fromJSON(object.noteData);
    } else {
      message.noteData = undefined;
    }
    return message;
  },

  toJSON(message: Figure): unknown {
    const obj: any = {};
    message.lineData !== undefined &&
      (obj.lineData = message.lineData
        ? LineData.toJSON(message.lineData)
        : undefined);
    message.noteData !== undefined &&
      (obj.noteData = message.noteData
        ? NoteData.toJSON(message.noteData)
        : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Figure>): Figure {
    const message = { ...baseFigure } as Figure;
    if (object.lineData !== undefined && object.lineData !== null) {
      message.lineData = LineData.fromPartial(object.lineData);
    } else {
      message.lineData = undefined;
    }
    if (object.noteData !== undefined && object.noteData !== null) {
      message.noteData = NoteData.fromPartial(object.noteData);
    } else {
      message.noteData = undefined;
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
    for (const v of message.figures) {
      Figure.encode(v!, writer.uint32(10).fork()).ldelim();
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
    message.figures = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.figures.push(Figure.decode(reader, reader.uint32()));
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
    message.figures = [];
    if (object.figures !== undefined && object.figures !== null) {
      for (const e of object.figures) {
        message.figures.push(Figure.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: GetAllFiguresResponse): unknown {
    const obj: any = {};
    if (message.figures) {
      obj.figures = message.figures.map(e =>
        e ? Figure.toJSON(e) : undefined
      );
    } else {
      obj.figures = [];
    }
    return obj;
  },

  fromPartial(
    object: DeepPartial<GetAllFiguresResponse>
  ): GetAllFiguresResponse {
    const message = { ...baseGetAllFiguresResponse } as GetAllFiguresResponse;
    message.figures = [];
    if (object.figures !== undefined && object.figures !== null) {
      for (const e of object.figures) {
        message.figures.push(Figure.fromPartial(e));
      }
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
    if (message.getAllFiguresRequest !== undefined) {
      GetAllFiguresRequest.encode(
        message.getAllFiguresRequest,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.getAllFiguresResponse !== undefined) {
      GetAllFiguresResponse.encode(
        message.getAllFiguresResponse,
        writer.uint32(26).fork()
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
          message.getAllFiguresRequest = GetAllFiguresRequest.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.getAllFiguresResponse = GetAllFiguresResponse.decode(
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
    return message;
  },

  toJSON(message: MessageWrapper): unknown {
    const obj: any = {};
    message.createWhiteboardRequest !== undefined &&
      (obj.createWhiteboardRequest = message.createWhiteboardRequest
        ? CreateWhiteboardRequest.toJSON(message.createWhiteboardRequest)
        : undefined);
    message.getAllFiguresRequest !== undefined &&
      (obj.getAllFiguresRequest = message.getAllFiguresRequest
        ? GetAllFiguresRequest.toJSON(message.getAllFiguresRequest)
        : undefined);
    message.getAllFiguresResponse !== undefined &&
      (obj.getAllFiguresResponse = message.getAllFiguresResponse
        ? GetAllFiguresResponse.toJSON(message.getAllFiguresResponse)
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
