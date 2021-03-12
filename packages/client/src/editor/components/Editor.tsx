import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactDOM
} from 'react';
import { useRecoilState } from 'recoil';
import ServerContext from '../../connection-context/server-connection';
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
import { addNote } from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';
import Stickies from './Stickies';

const Editor = (props: { x: number; y: number }) => {
  const { connection: serverConnection } = useContext(ServerContext);
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
        startLine(point);
      } else if (mode === 'erase') {
        startErase(point);
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
      const point = { x: event.x, y: event.y };

      if (pointerDown) {
        if (mode === 'draw') {
          appendLine(point);
        } else if (mode === 'erase') {
          appendErase(point);
        }
      }
      render(getCtx()!, canvas.current!);
    },
    [mode, pointerDown]
  );

  const renderUndo = () => {
    undo();
    render(getCtx()!, canvas.current!);
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
    const timer = setInterval(() => render(getCtx()!, canvas.current!), 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="editor">
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
