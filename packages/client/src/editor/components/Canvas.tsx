import React, { useEffect, useRef } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { addNote } from '../../controllers/note-controller';
import { addImage } from '../../controllers/image-controller'
import { useEffectiveLines, useEffectiveImages } from '../../store/hooks';
import { useDrawing } from '../drawing-state';
import render from '../render';
import { modeState, imgState } from '../state';

const Canvas = (props: { x: number; y: number }) => {
  const effectiveLines = useEffectiveLines();
  const effectiveImages = useEffectiveImages();
  const canvas = useRef<HTMLCanvasElement>(null);
  const mode = useRecoilValue(modeState);
  const [imgData, setImgData] = useRecoilState(imgState)

  const getCtx = () => {
    return canvas.current !== null ? canvas.current.getContext('2d') : null;
  };

  useDrawing(canvas);

  // Main render function
  useEffect(() => {
    render(getCtx()!, canvas.current!, [...effectiveLines.values()]);
  }, [effectiveLines]);

  useEffect(() => {
    if (effectiveImages) {
      Array.from(effectiveImages.values()).map( image => {
        let img = new Image()
        img.src = image.data;
        img.addEventListener('load', function() {
          getCtx()!.drawImage(img, image.position.x, image.position.y);
        });
      });
    }
  }, [effectiveImages]);

  useEffect(() => {
    const c = canvas.current;
    if (c !== null && mode === 'note') {
      const listener = (event: PointerEvent) => {
        const point = { x: event.offsetX, y: event.offsetY };
        addNote(point);
      };
      c.addEventListener('pointerdown', listener);
      return () => c.removeEventListener('pointerdown', listener);
    } else if (c !== null && mode === 'image' && imgData.length !== 0) { // If imgData is empty string image can't be added
      const listener = (event: PointerEvent) => {
        const point = { x: event.offsetX, y: event.offsetY };
        addImage(point, imgData);
        setImgData(''); // Once image has been added set imgData recoil state to empty string
      };
      c.addEventListener('pointerdown', listener);
      return () => c.removeEventListener('pointerdown', listener);
    }
  }, [mode]);

  return (
    <canvas
      ref={canvas}
      id="canvas"
      height={props.y}
      width={props.x}
      style={{ border: '1px solid black', backgroundColor: 'white' }}
    ></canvas>
  );
  // Layered canvas
  // https://github.com/federicojacobi/layeredCanvas
};

export default Canvas;
