// --------------
// Code basically copied from:
// https://www.ankursheel.com/blog/react-component-draw-page-hooks-typescript
// https://github.com/AnkurSheel/react-drawing-interaction/blob/master/src/canvas.tsx
// --------------

import React, { useCallback, useEffect, useRef, useState } from 'react';

type Coordinate = {
  x: number;
  y: number;
}

function Canvas(props: {x: number, y:number}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState<Coordinate | undefined>(undefined);

  const startDraw = useCallback(
    (event: MouseEvent) => {
      const xy = getCoordinates(event);
      if (xy) {
        setMousePos(xy);
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
      context.strokeStyle = 'black';
      context.lineJoin = 'bevel';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(originalMousePos.x, originalMousePos.y);
      context.lineTo(newMousePos.x, newMousePos.y);
      context.closePath();
      context.stroke();
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} height={props.x} width={props.y} />
    </div>
  );
}

export default Canvas