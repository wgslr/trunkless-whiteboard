// --------------
// Some parts copied from:
// https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
// https://github.com/AnkurSheel/react-drawing-interaction/blob/master/src/canvas.tsx
// --------------

import { Coordinate, Action } from '../types'
import { ServerConnection } from '../serverClient';

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

function linePoints (a: Coordinate, b: Coordinate) {
  let xDiff = b.x - a.x;
  let yDiff = b.y - a.y;
  
  let noOfPoints = Math.sqrt(xDiff*xDiff+yDiff*yDiff); // distance between points is equal to number of pixels between points

  let xInterval = xDiff / (noOfPoints);
  let yInterval = yDiff / (noOfPoints);
  let coordList = [];
  for (let i = 0; i <= noOfPoints; i++) {
    coordList.push( {x: Math.floor(a.x + xInterval*i), y: Math.floor(a.y + yInterval*i)} )
  }
  return coordList; // coordList includes original Coords a & b
};


// This function returns the pixels to be erased between two sampled around a specified radius of a square of pixels
function erasePoints (a: Coordinate, b: Coordinate) {
  let radius = 3; //px

  let xDiff = b.x - a.x;
  let yDiff = b.y - a.y;  
  let noOfPoints = Math.sqrt(xDiff*xDiff+yDiff*yDiff); // distance between points is equal to number of pixels between points

  let xInterval = xDiff / (noOfPoints);
  let yInterval = yDiff / (noOfPoints);

  let norm1 = {x: -yInterval, y: xInterval};
  let norm2 = {x: yInterval, y: -xInterval};

  let coordList = [];
  for (let i = 0; i <= noOfPoints; i++) {
    let x = Math.floor(a.x + xInterval*i);
    let y = Math.floor(a.y + yInterval*i);
    let nextPoint = {x,y};
    coordList.push( { x: x, y: y } );
    for (let j = 1; j < radius; j++) {   // Some better algorithm should be used here to avoid redundancy
      coordList.push( {x: Math.floor(nextPoint.x + j*norm1.x), y: Math.floor(nextPoint.y + j*norm1.y) } );
      coordList.push( {x: Math.floor(nextPoint.x + j*norm2.x), y: Math.floor(nextPoint.y + j*norm2.y) } );
    }
  }
  return coordList; // coordList includes a bunch of redundant pixels as the "radius window" traverses the canvas
};

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
            erasedPixels.push(new Map<Coordinate, number>());
            erasedPixels[eraseIndex].set({x: C.x, y: C.y}, value); // TODO set 'value' to line UUID
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