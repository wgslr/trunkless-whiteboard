import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { addNote } from '../../controllers/note-controller';
import { addImage } from '../../controllers/image-controller'
import { useEffectiveLines, useEffectiveImages } from '../../store/hooks';
import { useDrawing } from '../drawing-state';
import render from '../render';
import { modeState, imgState } from '../state';

import logo from './wbicon.png'

const Canvas = (props: { x: number; y: number }) => {
  const effectiveLines = useEffectiveLines();
  const effectiveImages = useEffectiveImages();
  const canvas1 = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);
  const mode = useRecoilValue(modeState);
  const imgData = useRecoilValue(imgState)

  const getCtx = (layer: number) => {
    switch (layer) {
      case 1: {
        return canvas1.current !== null ? canvas1.current.getContext('2d') : null;
      }
      case 2: {
        return canvas2.current !== null ? canvas2.current.getContext('2d') : null;
      }
    }

  };

  useDrawing(canvas1);

  // Main render function
  useEffect(() => {
    render(getCtx(1)!, canvas1.current!, [...effectiveLines.values()]);
  }, [effectiveLines]);

  useEffect(() => {
    // eslint-disable-next-line array-callback-return
    Array.from(effectiveImages.values()).map( image => {
      let img = new Image()
      var blob = new Blob([image.data], {type: 'application/octet-binary'} )
      img.src = URL.createObjectURL(blob);
      img.addEventListener('load', function() {
        getCtx(2)!.drawImage(img, image.position.x, image.position.y);
      });
    });
  }, [effectiveImages]);

  useEffect(() => {
    const c = canvas1.current;
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
        if (imgData.length !== 0) { // If imgData is empty string image can't be added
          addImage(point, imgData);
        }
      };
      c.addEventListener('pointerdown', listener);
      return () => c.removeEventListener('pointerdown', listener);
    }
  }, [mode, imgData]);

  return (
    <div
      style={{position: 'relative',
              width: props.x,
              height: props.y}}>
      <canvas
        ref={canvas1}
        id="canvas"
        height={props.y}
        width={props.x}
        style={{ border: '1px solid black',
                zIndex: 0,
                position: 'absolute',
                left: '0px',
                top: '0px' }}
      ></canvas>
      <canvas
        ref={canvas2}
        id="canvas"
        height={props.y}
        width={props.x}
        style={{ border: '1px solid black',
                backgroundColor: 'white',
                zIndex: -1,
                position: 'absolute',
                left: '0px',
                top: '0px' }}
      ></canvas>
    </div>

  );
  // Layered canvas
  // https://github.com/federicojacobi/layeredCanvas
};

export default Canvas;
