import { Coordinates, Line, UUID, Action, Note, Img } from '../types';
import { linePoints, erasePoints } from './math';
import { serverConnection } from '../connection-context/server-connection';
import { v5 } from 'uuid';

export const bitmap: Line[] = [];

export const history: Action[] = [];

export const images: Img[] = [];

let drawing = false;
let erasing = false;

let lastPos: Coordinates | null = null;
let eraseBuffer: Coordinates[] = [];
let erasedPixels: Map<UUID, Coordinates[]> = new Map<UUID, Coordinates[]>();

// TODO using v5 is temporary; generate random v4 UUIDs
const UUID_NAMESPACE = '940beed9-f057-4088-a714-a9f5f2fc6052';

export const startLine = (point: Coordinates) => {
  drawing = true;
  bitmap.push({
    UUID: v5('line' + (bitmap.length - 1).toString(), UUID_NAMESPACE),
    points: new Map<Coordinates, number>()
  }); // placeholder UUID
  bitmap[bitmap.length - 1].points.set(point, 1);
  lastPos = point;
};

export const appendLine = (point: Coordinates) => {
  if (!drawing) {
    return;
  }
  let list = linePoints(lastPos!, point);
  for (let i = 0; i < list.length; i++) {
    bitmap[bitmap.length - 1].points.set(list[i], 1);
  }
  lastPos = point;
  serverConnection.connection.publishLine(bitmap[bitmap.length - 1]);
};

export const finishLine = () => {
  history.push({
    type: 'draw',
    UUID: bitmap[bitmap.length - 1].UUID
  });
  drawing = false;

  // TODO send update request to server
  serverConnection.connection.publishLine(bitmap[bitmap.length - 1]);
};

export const startErase = (point: Coordinates) => {
  erasing = true;
  eraseBuffer = [];
  erasedPixels = new Map<UUID, Coordinates[]>();
  //eraseIndex++;
  eraseBuffer.push(point);
  lastPos = point;
};

export const appendErase = (point: Coordinates) => {
  if (!erasing) {
    return;
  }
  eraseBuffer = [];
  let list = erasePoints(lastPos!, point);
  for (let i = 0; i < list.length; i++) {
    eraseBuffer.push(list[i]);
  }
  updateErase();
  lastPos = point;
};

const updateErase = () => {
  eraseBuffer.map((coord, j) => {
    bitmap.map((line, i) => {
      line.points.forEach((value, key) => {
        if (coord.x == key.x && coord.y == key.y) {
          line.points.set(key, 0); // This pixel will not be rendered anymore
          if (!erasedPixels.has(line.UUID)) {
            erasedPixels.set(line.UUID, [coord]); // and the erased pixel is added by UUID to erasedPixels...
          } else {
            let erasedCoords = erasedPixels.get(line.UUID);
            erasedCoords!.push(coord);
            erasedPixels.set(line.UUID, erasedCoords!);
          }
        }
      });
    });
  });
};

export const finishErase = () => {
  if (!erasing) {
    return;
  }
  history.push({
    type: 'erase',
    lines: erasedPixels
  });
  erasing = false;

  // TODO send update request to server
};

export const undo = () => {
  if (history.length == 0) {
    return;
  }
  const findFunction = (a: string, b: string) => a == b;
  let lastAction = history[history.length - 1];

  if (lastAction.type == 'draw') {
    let id = lastAction.UUID;
    let index = bitmap.findIndex(x => findFunction(x.UUID, id));
    if (index != -1) {
      bitmap.splice(index, 1);
    }

    history.pop();

    // TODO send update to server
  } else if (lastAction.type == 'erase') {
    lastAction.lines.forEach((modifiedPixels, uuid) => {
      let index = bitmap.findIndex(x => findFunction(uuid, x.UUID));
      if (index != -1) {
        modifiedPixels.forEach(coord => {
          bitmap[index].points.set(coord, 1);
        });
      }
    });
    history.pop();
  }
};
