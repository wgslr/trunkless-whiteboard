// --------------
// Code basically copied from:
// https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
// https://github.com/AnkurSheel/react-drawing-interaction/blob/master/src/canvas.tsx
// --------------

// TODO
// - Change to bitmap drawing
//    http://jsfiddle.net/sierawski/4xezb7nL/
// - Add data structure to save bitmap object
//

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createTextSpanFromBounds } from 'typescript';
import { Coordinate } from '../types';

export const bitmap = new Map<Coordinate, number>();


function Canvas(props: {x: number, y:number}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState<Coordinate | undefined>(undefined);

  const startDraw = useCallback(
    (event: MouseEvent) => {
      const mousePos = getCoordinates(event);
      if (mousePos) {
        drawPixel(mousePos);
        setMousePos(mousePos);
        setIsDrawing(true);
      }
    }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
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
          bitmap.set(newMousePos, 1);
          console.log(newMousePos);
          drawPixel(newMousePos);
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

  function drawPixel(mousePos: Coordinate) {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillRect(mousePos.x, mousePos.y, 1, 1);
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} height={props.y} width={props.x} />
    </div>
  );
}

export default Canvas