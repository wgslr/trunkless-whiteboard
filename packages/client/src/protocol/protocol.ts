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
  type: FigureType;
  Coordinates: Coordinates | undefined;
  lineData: LineData | undefined;
  noteData: NoteData | undefined;
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

const baseFigure: object = { type: 0 };

export const Figure = {
  encode(
    message: Figure,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.Coordinates !== undefined) {
      Coordinates.encode(
        message.Coordinates,
        writer.uint32(18).fork()
      ).ldelim();
    }
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
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.Coordinates = Coordinates.decode(reader, reader.uint32());
          break;
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
    if (object.type !== undefined && object.type !== null) {
      message.type = figureTypeFromJSON(object.type);
    } else {
      message.type = 0;
    }
    if (object.Coordinates !== undefined && object.Coordinates !== null) {
      message.Coordinates = Coordinates.fromJSON(object.Coordinates);
    } else {
      message.Coordinates = undefined;
    }
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
    message.type !== undefined && (obj.type = figureTypeToJSON(message.type));
    message.Coordinates !== undefined &&
      (obj.Coordinates = message.Coordinates
        ? Coordinates.toJSON(message.Coordinates)
        : undefined);
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
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    } else {
      message.type = 0;
    }
    if (object.Coordinates !== undefined && object.Coordinates !== null) {
      message.Coordinates = Coordinates.fromPartial(object.Coordinates);
    } else {
      message.Coordinates = undefined;
    }
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
