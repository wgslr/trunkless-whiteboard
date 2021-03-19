import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { addNote } from '../../controllers/note-controller';
import { useEffectiveLines } from '../../store/hooks';
import { useDrawing } from '../drawing-state';
import render from '../render';
import { modeState } from '../state';

const Canvas = (props: { x: number; y: number }) => {
  const effectiveLines = useEffectiveLines();
  const canvas = useRef<HTMLCanvasElement>(null);
  const mode = useRecoilValue(modeState);

  const getCtx = () => {
    return canvas.current !== null ? canvas.current.getContext('2d') : null;
  };

  useDrawing(canvas);

  // Main render function
  useEffect(() => {
    render(getCtx()!, canvas.current!, [...effectiveLines.values()]);
  }, [effectiveLines]);

  useEffect(() => {
    const c = canvas.current;
    if (c !== null && mode === 'note') {
      const listener = (event: PointerEvent) => {
        const point = { x: event.offsetX, y: event.offsetY };
        addNote(point);
      };
      c.addEventListener('pointerdown', listener);
      return () => c.removeEventListener('pointerdown', listener);
    } else if (c !== null && mode === 'image') {
      const listener = (event: PointerEvent) => {
        const point = { x: event.offsetX, y: event.offsetY };
        addImage(point);
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
  // Layered canvas
  // https://github.com/federicojacobi/layeredCanvas
};

export default Canvas;
