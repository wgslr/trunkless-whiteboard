import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { addNote } from '../../controllers/note-controller';
import { useEffectiveLines } from '../../store/hooks';
import { coordToNumber } from '../../utils';
import render from '../render';
import { modeState } from '../state';
import {
  appendErase,
  appendLine,
  finishErase,
  finishLine,
  startErase,
  startLine,
  undo
} from '../whiteboard';
import Stickies from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';

const Editor = (props: { x: number; y: number }) => {
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

  const renderUndo = () => {
    undo();
  };

  useEffect(() => {
    if (canvas.current === null) {
      return;
    }
  }, []);

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

  // Main render function
  useEffect(() => {
    render(getCtx()!, canvas.current!, [...effectiveLines.values()]);
  }, [effectiveLines]);

  return (
    <div
      id="editor"
      style={{
        height: props.y,
        width: props.x
      }}
    >
      <div>
        <Tools />
        <UndoTool onClick={renderUndo} />
      </div>
      <Stickies />
      <canvas
        ref={canvas}
        height={props.y}
        width={props.x}
        style={{ border: '1px solid black', backgroundColor: 'white' }}
      ></canvas>
    </div>
  );
  // <Cursor canvas={canvas.current!}></Cursor>

  // Layered canvas
  // https://github.com/federicojacobi/layeredCanvas
};

export default Editor;
