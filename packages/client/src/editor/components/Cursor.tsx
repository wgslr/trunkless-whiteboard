import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draw from '../../cursors/Draw';
import Erase from '../../cursors/Erase';
import { useRecoilValue } from 'recoil';
import { Mode } from '../../types';
import { modeState } from '../state';

// Draw single pixel https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas

const cursors = {
  draw: {
    component: Draw,
    offset: { x: 0, y: -16 }
  },
  erase: {
    component: Erase,
    offset: { x: 8, y: -16 }
  },
  note: {
    component: Draw,
    offset: { x: 0, y: -16 }
  }
};

const Cursor = ({ canvas }: { canvas: HTMLCanvasElement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const mode = useRecoilValue(modeState);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const modeToCursor = useCallback((mode: Mode) => {
    switch (mode) {
      case 'draw':
        return cursors.draw;
      case 'erase':
        return cursors.erase;
      case 'note':
        return cursors.note;
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsDrawing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHidden(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHidden(false);
  }, []);

  const updateMousePos = useCallback(() => {
    const x = position.current.x + modeToCursor(mode).offset.x;
    const y = position.current.y + modeToCursor(mode).offset.y;
    ref.current!.style.transform = `translate(${x}px, ${y}px)`;
  }, [mode, modeToCursor]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      position.current.x = event.clientX - canvas.offsetWidth;
      position.current.y =
        event.clientY - canvas.offsetHeight - canvas.offsetTop;
      updateMousePos();
    },
    [updateMousePos]
  );

  useEffect(() => {
    updateMousePos();
  }, [updateMousePos]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [canvas, handleMouseMove, handleMouseDown, handleMouseUp]);

  const Component = modeToCursor(mode).component;
  return (
    <div ref={ref} hidden={isHidden}>
      {mode === 'draw'}
      <Component />
    </div>
  );
};

export default Cursor;
