// --------------
// Some parts copied from:
// https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
// https://github.com/AnkurSheel/react-drawing-interaction/blob/master/src/canvas.tsx
// --------------

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Coordinate, Action } from '../types'
import { ServerConnection } from '../serverClient';

export const bitmap: Map<Coordinate, number>[] = [];
let lineIndex = -1;

export const history: Action[] = [];
let historyIndex = -1;

let drawing = false;
let erasing = false;

let lastPos: Coordinate | null = null;
let eraseBuffer: Coordinate[][] = [];
let eraseSuccess: boolean[] = [];
let eraseIndex = -1;

function linePoints (a: Coordinate, b: Coordinate) {
  let xDiff = b.x - a.x;
  let yDiff = b.y - a.y;
  
  let resolution = 1.5;
  let noOfPoints = Math.sqrt(xDiff*xDiff+yDiff*yDiff) / resolution; // distance between points is equal to number of pixels between points

  let xInterval = xDiff / (noOfPoints);
  let yInterval = yDiff / (noOfPoints);
  let coordList = [];
  for (let i = 0; i <= noOfPoints; i++) {
    coordList.push( {x: (a.x + xInterval*i), y: (a.y + yInterval*i)} )
  }
  return coordList; // coordList includes original Coords a & b
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
  erasing = true;
  eraseBuffer.push([]);
  eraseIndex++;
  eraseBuffer[eraseIndex].push(point);
};

export const appendErase = (point: Coordinate) => {
  if (!erasing) {
    return;
  }
  eraseBuffer[eraseIndex].push(point);
};

export const finishErase = () => {
  if (!erasing) {
    return;
  }
  let erasedPixels = false;

  eraseBuffer[eraseIndex].map((C, j) => {
    bitmap.map( (M, i) => {
      M.forEach( (value,key) => {
        if (C.x == key.x && C.y == key.y) {
          M.set(key, 0);
          erasedPixels = true;
        }
      })
    })
  })
  eraseSuccess.push(erasedPixels)
};