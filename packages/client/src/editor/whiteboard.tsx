// --------------
// Some parts copied from:
// https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
// https://github.com/AnkurSheel/react-drawing-interaction/blob/master/src/canvas.tsx
// --------------

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Coordinate } from '../types'

export const bitmap: Map<Coordinate, number>[] = [];
export let lineIndex = -1;

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
}

function Canvas(props: {x: number, y:number}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState<Coordinate | undefined>(undefined);

  const startDraw = useCallback(
    (event: MouseEvent) => {
      const xy = getCoordinates(event);
      if (xy) {
        bitmap.push(new Map<Coordinate, number>());
        lineIndex++;
        setMousePos(xy);
        setIsDrawing(true);
      }
    }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    console.log(bitmap);
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousedown', startDraw);
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
    };
  }, [startDraw]);

  const draw = useCallback(
    (event: MouseEvent) => {
      if (isDrawing) {
        const newMousePos = getCoordinates(event);
        if (mousePos && newMousePos) {
          drawLine(mousePos, newMousePos);
          setMousePos(newMousePos);
        }
      }
    },
    [isDrawing, mousePos]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousemove', draw);
    return () => {
      canvas.removeEventListener('mousemove', draw);
    };
  }, [draw]);

  const exitDraw = useCallback(() => {
    setIsDrawing(false);
    setMousePos(undefined);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mouseup', exitDraw);
    canvas.addEventListener('mouseleave', exitDraw);
    return () => {
      canvas.addEventListener('mouseup', exitDraw);
      canvas.addEventListener('mouseleave', exitDraw);
    };
  }, [exitDraw]);

  function getCoordinates(event: MouseEvent): Coordinate | undefined {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;

    return { x: event.pageX - canvas.offsetLeft, y: event.pageY - canvas.offsetTop };
  }

  function drawLine(originalMousePos: Coordinate, newMousePos: Coordinate) {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      let list = linePoints(originalMousePos, newMousePos);

      for (let i = 0; i < list.length; i++) {
        let pixel = list[i];
        context.fillRect(pixel.x, pixel.y, 1, 1)
        bitmap[lineIndex].set(pixel, 1);
      }
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} height={props.y} width={props.x} style={{border: '1px solid black', backgroundColor: 'white'}} />
    </div>
  );
}

export default Canvas