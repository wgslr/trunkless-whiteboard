import lodash from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  addLine,
  addPointsToLine,
  removePointsFromLine
} from '../controllers/line-controller';
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
const FLUSH_PERIOD_MS = 100;

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

const flushEraseBuffer = () => {};

const flush = (contextSnapshot: Context) => {
  // receives the context as arugment instead of using the global
  // variable, to avoid running after the context switches to 'IDLE',
  // which caused loss of line ending segments
  if (contextSnapshot.status === 'DRAWING') {
    addPointsToLine(contextSnapshot.lineId, contextSnapshot.drawnPixelsBuffer);
    contextSnapshot.drawnPixelsBuffer = new Set();
  } else if (context.status === 'ERASING') {
    flushEraseBuffer();
  }
};
const throttledFlushDrawing = lodash.throttle(flush, FLUSH_PERIOD_MS, {
  leading: true,
  trailing: true
});

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
  if (context.status !== 'IDLE') {
    throttledFlushDrawing(context);
  }
};

type Return = [draw: Set<CoordNumber>, erase: Set<CoordNumber>];

/**
 * Sets up listeners on canvas to handle drawing.
 * Returns pixels from the temporary buffers for rendering loally.
 */
export const useDrawing = (canvas: React.RefObject<HTMLCanvasElement>) => {
  const [temporary, setTemporary] = useState<Return>([new Set(), new Set()]);
  const mode = useRecoilValue(modeState);

  const updateTemporary = () => {
    if (context.status === 'DRAWING') {
      const buffer = context.drawnPixelsBuffer;
      setTemporary(prev => [setUnion(prev[0], buffer), new Set()]);
    } else if (context.status === 'ERASING') {
      const buffer = context.erasedPixelsBuffer;
      setTemporary(prev => [new Set(), setUnion(prev[1], buffer)]);
    } else {
      setTemporary(prev =>
        prev[0].size === 0 && prev[1].size === 0 ? prev : [new Set(), new Set()]
      );
    }
  };

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      const point = coordToNumber({ x: event.x, y: event.y });
      onPointerDown(point, mode);
      updateTemporary();
    },
    [mode]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.x, y: event.y });
      onPointerMove(point);
      updateTemporary();
    },
    [canvas]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.x, y: event.y });
      onPointerMove(point); // add potentially missing points
      updateTemporary();
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

  return temporary;
};
