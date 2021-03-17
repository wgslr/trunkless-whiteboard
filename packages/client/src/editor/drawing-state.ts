import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CoordNumber } from '../types';
import { coordToNumber, setUnion } from '../utils';
import { calculateErasePoints, calculateLinePoints } from './math';
import { modeState } from './state';

type Context =
  | {
      status: 'IDLE';
    }
  | {
      status: 'DRAWING';
      lastPosition: CoordNumber;
      drawnPixelsBuffer: Set<CoordNumber>;
    }
  | {
      status: 'ERASING';
      lastPosition: CoordNumber;
      erasedPixelsBuffer: Set<CoordNumber>;
    };

const deriveStateFromNewPosition = (
  newPosition: CoordNumber,
  prevContext: Context
): Context => {
  switch (prevContext.status) {
    case 'IDLE':
      return prevContext;
    case 'DRAWING':
      return {
        status: 'DRAWING',
        lastPosition: newPosition,
        drawnPixelsBuffer: setUnion(
          prevContext.drawnPixelsBuffer,
          calculateLinePoints(prevContext.lastPosition, newPosition)
        )
      };
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

export const useDrawing = (canvas: React.RefObject<HTMLCanvasElement>) => {
  const [context, setContext] = useState<Context>({ status: 'IDLE' });
  const mode = useRecoilValue(modeState);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      console.log('pointer down. mode:', { mode });
      const point = coordToNumber({ x: event.x, y: event.y });
      if (mode === 'draw') {
        setContext({
          status: 'DRAWING',
          lastPosition: point,
          drawnPixelsBuffer: new Set([point])
        });
      } else if (mode === 'erase') {
        setContext({
          status: 'ERASING',
          lastPosition: point,
          erasedPixelsBuffer: new Set([point])
        });
      }
      // adding notes handled elsewhere
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
      setContext(prev => {
        const derived = deriveStateFromNewPosition(point, prev);
        console.log({ derived });
        return derived;
      });
      // adding notes handled elsewhere
    },
    [canvas]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      console.log('pointer up');
      if (event.target !== canvas.current) {
        return;
      }
      // const point = coordToNumber({ x: event.x, y: event.y });
      // setContext(prev => deriveStateFromNewPosition(point, prev));
      setContext({ status: 'IDLE' });
      // adding notes handled elsewhere
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
  }, [handlePointerMove, handlePointerDown, handlePointerUp]);

  return context;
};
