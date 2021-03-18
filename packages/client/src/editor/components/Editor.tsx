import { useRef } from 'react';
import Canvas from './Canvas';
import Stickies from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';

const Editor = (props: { x: number; y: number }) => {
  const canvRef = useRef<HTMLCanvasElement>(null);

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
        <UndoTool onClick={() => {}} />
      </div>
      
      <Canvas {...props} />
      <Stickies />
    </div>
  );
  // <Cursor canvas={canvas.current!}></Cursor>

  // Layered canvas
  // https://github.com/federicojacobi/layeredCanvas
};

export default Editor;
