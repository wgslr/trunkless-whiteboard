//import React, { useCallback, useEffect, useRef} from "react";
//import { isContext } from "vm";
//import {Coordinate} from '../types';
import { Coordinates } from '../protocol/protocol';
import { CoordNumber, Line } from '../types';
import { numberToCoord } from '../utils';

const reset = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const render = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  lines: Line[],
  forceDraw: Set<CoordNumber> = new Set(),
  forceErase: Set<CoordNumber> = new Set()
) => {
  if (ctx == null) {
    throw new Error('no ctx');
  }
  reset(ctx, canvas);

  var img = new Image();
  img.addEventListener('load', function() {
      ctx.drawImage(img, 100,100);
  });
  img.src = './wbicon.png';

  ctx.fillStyle = '#000000';
  const drawPoint = ({ x, y }: Coordinates) => {
    ctx.fillRect(x, y, 1, 1);
  };
  console.debug(`canvas render: drawing ${lines.length} lines`);
  lines.forEach(line => {
    line.points.forEach(pointNumber => {
      drawPoint(numberToCoord(pointNumber));
    });
  });
  forceDraw.forEach(pointNumber => drawPoint(numberToCoord(pointNumber)));

  ctx.fillStyle = '#ffffff';
  forceErase.forEach(pointNumber => drawPoint(numberToCoord(pointNumber)));
};
export default render;
