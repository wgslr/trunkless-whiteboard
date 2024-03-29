import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { useSnapshot } from 'valtio';
import { addImage } from '../../controllers/image-controller';
import { addNote } from '../../controllers/note-controller';
import { useEffectiveImages, useEffectiveLines } from '../../store/hooks';
import { useDrawing } from '../drawing-state';
import { renderImages, renderLines } from '../render';
import { editorState, imgState } from '../state';

const Canvas = (props: { x: number; y: number }) => {
  const effectiveLines = useEffectiveLines();
  const effectiveImages = useEffectiveImages();
  const whiteboardCanvas = useRef<HTMLCanvasElement>(null);
  const imageCanvas = useRef<HTMLCanvasElement>(null);
  const { mode } = useSnapshot(editorState);
  const imgData = useRecoilValue(imgState);

  const getCtx = (layer: number) => {
    switch (layer) {
      case 1: {
        return whiteboardCanvas.current !== null
          ? whiteboardCanvas.current.getContext('2d')
          : null;
      }
      case 2: {
        return imageCanvas.current !== null
          ? imageCanvas.current.getContext('2d')
          : null;
      }
    }
  };

  useDrawing(whiteboardCanvas);

  // Main render function
  useEffect(() => {
    renderLines(getCtx(1)!, whiteboardCanvas.current!, [
      ...effectiveLines.values()
    ]);
  }, [effectiveLines]);

  useEffect(() => {
    renderImages(getCtx(2)!, effectiveImages);
  }, [effectiveImages]);

  useEffect(() => {
    const c = whiteboardCanvas.current;
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
        if (imgData.length !== 0) {
          // If imgData is empty string image can't be added
          addImage(point, imgData);
        }
      };
      c.addEventListener('pointerdown', listener);
      return () => c.removeEventListener('pointerdown', listener);
    }
  }, [mode, imgData]);

  return (
    <div style={{ position: 'relative', width: props.x, height: props.y }}>
      <canvas
        ref={whiteboardCanvas}
        id="whiteboard-canvas"
        height={props.y}
        width={props.x}
        style={{
          border: '1px solid black',
          zIndex: 0,
          position: 'absolute',
          left: '0px',
          top: '0px'
        }}
      ></canvas>
      <canvas
        ref={imageCanvas}
        id="image-canvas"
        height={props.y}
        width={props.x}
        style={{
          border: '1px solid black',
          backgroundColor: 'white',
          zIndex: -1,
          position: 'absolute',
          left: '0px',
          top: '0px'
        }}
      ></canvas>
    </div>
  );
};

export default Canvas;
