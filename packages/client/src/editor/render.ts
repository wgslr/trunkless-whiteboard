//import React, { useCallback, useEffect, useRef} from "react";
//import { isContext } from "vm";
//import {Coordinate} from '../types';
import { Line } from '../types';
import { numberToCoord } from '../utils';

const reset = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const render = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  lines: Line[]
) => {
  if (ctx == null) {
    throw new Error('no ctx');
  }
  reset(ctx, canvas);

  ctx.fillStyle = '#000000';
  console.debug(`canvas render: drawing ${lines.length} lines`);
  lines.forEach(line => {
    line.points.forEach(pointNumber => {
      const point = numberToCoord(pointNumber);
      ctx.fillRect(
        point.x - canvas.offsetLeft,
        point.y - canvas.offsetTop,
        1,
        1
      );
    });
  });
};
export default render;
