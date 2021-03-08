import { ServerConnection } from '../serverClient'; // TODO implement server communication handler, probably in separate file..

import { Coordinate, Line, UUID, Action } from '../types';
import { linePoints, erasePoints }from './math';
import { encodeUUID } from './encoding';

export const bitmap: Line[] = [];
let lineIndex = -1;

export const history: Action[] = [];
let historyIndex = -1;

let drawing = false;
let erasing = false;

let lastPos: Coordinate | null = null;
let eraseBuffer: Coordinate[] = [];
let erasedPixels: Map<UUID, Coordinate[]> = new Map<UUID, Coordinate[]>();
let eraseIndex = -1;

export const startLine = (point: Coordinate) => {
  drawing = true;
  bitmap.push(
    {UUID: 'line' + lineIndex.toString, points: new Map<Coordinate, number>()}); // placeholder UUID
  lineIndex++;
  bitmap[lineIndex].points.set(point, 1);
  lastPos = point;
};

export const appendLine = (point: Coordinate) => {
  if (!drawing) {
    return;
  }
  let list = linePoints(lastPos!, point);
  for (let i = 0; i < list.length; i++) {
    bitmap[lineIndex].points.set(list[i], 1);
  }
  lastPos = point;
};

export const finishLine = () => {
  history.push({
    type: 'draw',
    UUID: bitmap[lineIndex].UUID
  });
  historyIndex++;
  drawing = false;

  // TODO send update request to server
};

export const startErase = (point: Coordinate) => {
  erasing = true;
  eraseBuffer = [];
  erasedPixels = new Map<UUID, Coordinate[]>();
  eraseIndex++;
  eraseBuffer.push(point);
  lastPos = point;
};

export const appendErase = (point: Coordinate) => {
  if (!erasing) {
    return;
  }
  eraseBuffer = []
  let list = erasePoints(lastPos!, point);
  for (let i = 0; i < list.length; i++) {
    eraseBuffer.push(list[i]);
  }
  updateErase();
  lastPos = point;
};

const updateErase = () => {
  eraseBuffer.map((coord, j) => {
    bitmap.map( (line, i) => {
      line.points.forEach( (value,key) => {
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
      })
    })
  })
};

export const finishErase = () => {
  if (!erasing) {
    return;
  }
  history.push({
    type: 'erase',
    lines: erasedPixels
  });
  historyIndex++;
  erasing = false;

  // TODO send update request to server
};

export const undo = () => {
  if (history.length == 0) {
    return;
  }

  let lastAction = history[historyIndex];

  if (lastAction.type == 'draw') {
    bitmap.splice(lineIndex, 1);
    historyIndex--;
    lineIndex--;
    history.pop();
  } else if (lastAction.type == 'erase') {
    lastAction.lines.forEach( (array, key) => {
      // TODO
    })
  }
}