// --------------
// Some parts copied from:
// https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
// https://github.com/AnkurSheel/react-drawing-interaction/blob/master/src/canvas.tsx
// --------------

import { Coordinate, Action } from '../types';
import { linePoints, erasePoints }from './math';
import { ServerConnection } from '../serverClient'; // TODO implement server communication handler, probably in separate file..

export const bitmap: Map<Coordinate, number>[] = [];
let lineIndex = -1;

export const history: Action[] = [];
let historyIndex = -1;

let drawing = false;
let erasing = false;
let didErasePixels = false;

let lastPos: Coordinate | null = null;
let eraseBuffer: Coordinate[] = [];
let erasedPixels: Map<Coordinate, number>[] = [];
let eraseSuccess: boolean[] = [];
let eraseIndex = -1;

export const startLine = (point: Coordinate) => {
  drawing = true;
  bitmap.push(new Map<Coordinate, number>());
  lineIndex++;
  bitmap[lineIndex].set(point, 1);
  lastPos = point;
};

export const appendLine = (point: Coordinate) => {
  if (!drawing) {
    return;
  }
  let list = linePoints(lastPos!, point);
  for (let i = 0; i < list.length; i++) {
    bitmap[lineIndex].set(list[i], 1);
  }
  lastPos = point;
};

export const finishLine = () => {
  history.push({
    type: 'draw',
    lineIndex: lineIndex
  });
  historyIndex++;
  drawing = false;
};

export const startErase = (point: Coordinate) => {
  didErasePixels = false
  erasing = true;
  eraseBuffer = [];
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
  eraseBuffer.map((C, j) => {
    bitmap.map( (M, i) => {
      M.forEach( (value,key) => {
        if (C.x == key.x && C.y == key.y) {
          M.set(key, 0);
          if (!didErasePixels) {
            didErasePixels = true;
            erasedPixels.push(new Map<Coordinate, number>()); // On first erased pixel a new map is added to keep track of which pixels have been deleted
            erasedPixels[eraseIndex].set({x: C.x, y: C.y}, value); // TODO set 'value' to line UUID to keep track of which lines are modified when sending update messages to server
          } else {
            erasedPixels[eraseIndex].set({x: C.x, y: C.y}, value); // TODO set 'value' to line UUID
          }
        }
      })
    })
  })
}

export const finishErase = () => {
  if (!erasing) {
    return;
  }
  history.push({
    type: 'erase',
    lineIndices: eraseBuffer
  });
  historyIndex++;
  eraseSuccess.push(didErasePixels);
  erasing = false;
};