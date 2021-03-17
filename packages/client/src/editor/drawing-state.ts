import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';
import { addLine, addPointsToLine } from '../controllers/line-controller';
import { CoordNumber, Mode, UUID } from '../types';
import { coordToNumber, setUnion } from '../utils';
import { calculateErasePoints, calculateLinePoints } from './math';
import { modeState } from './state';

type Context =
  | {
      status: 'IDLE';
    }
  | {
      status: 'DRAWING';
      lineId: UUID;
      lastPosition: CoordNumber;
      drawnPixelsBuffer: Set<CoordNumber>; // contains only points which were not added to the global store yet
    }
  | {
      status: 'ERASING';
      lastPosition: CoordNumber;
      erasedPixelsBuffer: Set<CoordNumber>;
    };

let context: Context = { status: 'IDLE' };

const deriveStateFromNewPosition = (
  newPosition: CoordNumber,
  prevContext: Context
): Context => {
  switch (prevContext.status) {
    case 'IDLE':
      return prevContext;
    case 'DRAWING': {
      return {
        ...prevContext,
        lastPosition: newPosition,
        drawnPixelsBuffer: setUnion(
          prevContext.drawnPixelsBuffer,
          calculateLinePoints(prevContext.lastPosition, newPosition)
        )
      };
    }
    case 'ERASING':
      return {
        status: 'ERASING',
        lastPosition: newPosition,
        erasedPixelsBuffer: setUnion(
          prevContext.erasedPixelsBuffer,
          calculateErasePoints(prevContext.lastPosition, newPosition)
        )
      };
  }
};

const onPointerDown = (position: CoordNumber, mode: Mode) => {
  if (mode === 'draw') {
    const { id } = addLine(new Set([position]));
    context = {
      status: 'DRAWING',
      lineId: id,
      lastPosition: position,
      drawnPixelsBuffer: new Set([position])
    };
  } else if (mode === 'erase') {
    context = {
      status: 'ERASING',
      lastPosition: position,
      erasedPixelsBuffer: new Set([position])
    };
  }
};

const onPointerMove = (newPosition: CoordNumber) => {
  context = deriveStateFromNewPosition(newPosition, context);
  if (context.status === 'DRAWING') {
    addPointsToLine(context.lineId, context.drawnPixelsBuffer);
    context.drawnPixelsBuffer = new Set();
  }
};

export const useDrawing = (canvas: React.RefObject<HTMLCanvasElement>) => {
  const mode = useRecoilValue(modeState);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      const point = coordToNumber({ x: event.x, y: event.y });
      onPointerDown(point, mode);
    },
    [mode]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      console.log('pointer move');
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.x, y: event.y });
      onPointerMove(point);
    },
    [canvas]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      console.log('pointer up');
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.x, y: event.y });
      onPointerMove(point); // add potentially missing points
      context = { status: 'IDLE' };
    },
    [canvas]
  );

  useEffect(() => {
    if (canvas.current === null) {
      return;
    }

    const canvasElem = canvas.current;

    canvasElem.addEventListener('pointermove', handlePointerMove);
    canvasElem.addEventListener('pointerdown', handlePointerDown);
    canvasElem.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvasElem.removeEventListener('pointermove', handlePointerMove);
      canvasElem.removeEventListener('pointerdown', handlePointerDown);
      canvasElem.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerDown, handlePointerUp, canvas]);

  // return context;
};
