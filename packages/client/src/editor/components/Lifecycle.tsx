import React from 'react';
import { useSnapshot } from 'valtio';
import { clientState } from '../../store/auth';
import Editor from './Editor';
import UsernamePrompt from './UsernamePrompt';
import WhiteboardPrompt from './WhiteboardPrompt';

const canvasX = 800;
const canvasY = 600;

export const Lifecycle: React.FunctionComponent = () => {
  const cState = useSnapshot(clientState);
  switch (cState.v.state) {
    case 'INITIALIZING': {
      return <div>Connecting...</div>;
    }
    case 'ANONYMOUS': {
      return <UsernamePrompt />;
    }
    case 'NO_WHITEBOARD': {
      return <WhiteboardPrompt />;
    }
    case 'DISCONNECTED': {
      return <div>Protocol disconnected</div>;
    }
    case 'WHITEBOARD_HOST':
      return <Editor x={canvasX} y={canvasY} />;
    case 'WHITEBOARD_USER':
      return <Editor x={canvasX} y={canvasY} />;
  }
};

export default Lifecycle;
