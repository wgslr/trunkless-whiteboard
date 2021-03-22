import lodash from 'lodash';
import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {
  addLine,
  addPointsToLine,
  removePointsFromLine
} from '../controllers/line-controller';
import { getEffectiveLines } from '../store';
import { Line, CoordNumber, Mode, UUID } from '../types';
import { coordToNumber, setIntersection, setUnion } from '../utils';
import { calculateErasePoints, calculateLinePoints } from './math';
import { modeState } from './state';
import { history } from './history';

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
      // contains only points which were not added to the global store yet
      erasedPixelsBuffer: Set<CoordNumber>;
      // contains all modified points during this erase operaation
      modifiedPixelsInLines: Map<Line['id'], Set<CoordNumber>>;
    };

let context: Context = { status: 'IDLE' };
const FLUSH_PERIOD_MS = 50;

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
        ...prevContext,
        lastPosition: newPosition,
        erasedPixelsBuffer: setUnion(
          prevContext.erasedPixelsBuffer,
          calculateErasePoints(prevContext.lastPosition, newPosition)
        )
      };
  }
};

const flushEraseBuffer = () => {
  if (context.status !== 'ERASING') return;

  const lines = getEffectiveLines().values();
  for (const line of lines) {
    const intersection = setIntersection(
      line.points,
      context.erasedPixelsBuffer
    );
    if (intersection.size > 0) {
      removePointsFromLine(line.id, intersection);
      const oldModified =
        context.modifiedPixelsInLines.get(line.id) ?? new Set();
      context.modifiedPixelsInLines.set(
        line.id,
        setUnion(oldModified, intersection)
      );
    }
  }
  context.erasedPixelsBuffer.clear();
};

const flush = () => {
  if (context.status === 'DRAWING' && context.drawnPixelsBuffer) {
    addPointsToLine(context.lineId, context.drawnPixelsBuffer);
    context.drawnPixelsBuffer.clear();
  } else if (context.status === 'ERASING') {
    flushEraseBuffer();
  }
};

// Use lodash.throttle to limit frequency of flush() exeuction. This increases
// latency of displaying the drawing locally, but reduces number of messages
// with line segments sent to the server.
const throttledFlush = lodash.throttle(flush, FLUSH_PERIOD_MS, {
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
      erasedPixelsBuffer: new Set([position]),
      modifiedPixelsInLines: new Map()
    };
  }
};

const onPointerMove = (newPosition: CoordNumber) => {
  if (context.status !== 'IDLE') {
    context = deriveStateFromNewPosition(newPosition, context);
    throttledFlush();
  }
};

const onPointerUp = (point: CoordNumber) => {
  if (context.status === 'IDLE') {
    return;
  }
  onPointerMove(point); // add last line/erase segment
  throttledFlush.flush();

  if (context.status === 'DRAWING') {
    finishDrawing();
  } else if (context.status === 'ERASING') {
    finishErase();
  }
};

const finishDrawing = () => {
  if (context.status !== 'DRAWING') return;
  history.push({
    type: 'DRAWN_LINE',
    lineId: context.lineId
  });
  context = { status: 'IDLE' };
};

const finishErase = () => {
  if (context.status !== 'ERASING') return;
  history.push({
    type: 'ERASED',
    lines: context.modifiedPixelsInLines
  });
  context = { status: 'IDLE' };
};

/**
 * Sets up listeners on canvas to handle drawing.
 */
export const useDrawing = (
  canvas: React.RefObject<HTMLCanvasElement>
): void => {
  const mode = useRecoilValue(modeState);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      const point = coordToNumber({ x: event.offsetX, y: event.offsetY });
      onPointerDown(point, mode);
    },
    [mode]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.offsetX, y: event.offsetY });
      onPointerMove(point);
    },
    [canvas]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.offsetX, y: event.offsetY });
      onPointerUp(point);
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
};
