import { Coordinates } from '../protocol/protocol';
import { CoordNumber, Line } from '../types';
import { numberToCoord } from '../utils';

const reset = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
