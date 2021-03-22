import React from 'react';
import { undo } from '../history';
import Canvas from './Canvas';
import Stickies from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';

const Editor = (props: { x: number; y: number }) => (
  <div
    id="editor"
    style={{
      height: props.y,
      width: props.x
    }}
  >
    <div>
      <Tools />
      <UndoTool onClick={undo} />
    </div>
    <Stickies />
    <Canvas {...props} />
  </div>
);

export default Editor;
