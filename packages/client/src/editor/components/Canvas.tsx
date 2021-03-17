import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { addNote } from '../../controllers/note-controller';
import { useEffectiveLines } from '../../store/hooks';
import { coordToNumber } from '../../utils';
import { Line } from '../../types';
import { useDrawing } from '../drawing-state';
import render from '../render';
import { modeState } from '../state';
import {
  appendErase,
  appendLine,
  finishErase,
  finishLine,
  startErase,
  startLine
} from '../whiteboard';

const Canvas = (props: { x: number; y: number }) => {
  const effectiveLines = [...useEffectiveLines().values()];
  const canvas = useRef<HTMLCanvasElement>(null);

  const getCtx = () => {
    return canvas.current !== null ? canvas.current.getContext('2d') : null;
  };

  const [mode, setMode] = useRecoilState(modeState);
  const [pointerDown, setPointerDown] = useState(false);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      setPointerDown(true);
      const point = { x: event.x, y: event.y };
      if (mode === 'draw') {
        startLine(coordToNumber(point));
      } else if (mode === 'erase') {
        startErase(coordToNumber(point));
      } else if (mode === 'note') {
        addNote(point);
      }
    },
    [mode]
  );

  const handlePointerUp = useCallback(() => {
    setPointerDown(false);
    if (mode === 'draw') {
      finishLine();
    } else if (mode === 'erase') {
      finishErase();
    }
  }, [mode]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (event.target !== canvas.current) {
        return;
      }
      const point = coordToNumber({ x: event.x, y: event.y });

      if (pointerDown) {
        if (mode === 'draw') {
          appendLine(point);
        } else if (mode === 'erase') {
          appendErase(point);
        }
      }
    },
    [mode, pointerDown]
  );

  useEffect(() => {
    if (canvas.current === null) {
      return;
    }
  }, []);

  useDrawing(canvas);

  // Main render function
  useEffect(() => {
    render(getCtx()!, canvas.current!, effectiveLines);
  }, [effectiveLines]);

  useEffect(() => {
    const c = canvas.current;
    if (c !== null && mode === 'note') {
      const listener = (event: PointerEvent) => {
        const point = { x: event.x, y: event.y };
        addNote(point);
      };
      c.addEventListener('pointerdown', listener);
      return () => c.removeEventListener('pointerdown', listener);
    }
  }, [mode]);

  return (
    <canvas
      ref={canvas}
      height={props.y}
      width={props.x}
      style={{ border: '1px solid black', backgroundColor: 'white' }}
    ></canvas>
  );
  // <Cursor canvas={canvas.current!}></Cursor>

  // Layered canvas
  // https://github.com/federicojacobi/layeredCanvas
};

export default Canvas;
