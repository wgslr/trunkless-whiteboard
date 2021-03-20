import React from 'react';
import { useSnapshot } from 'valtio';
import { clientState } from '../../store/auth';
import Editor from './Editor';
import UsernamePrompt from './UsernamePrompt';

const canvasX = 800;
const canvasY = 600;

export const Lifecycle: React.FunctionComponent = () => {
  const cState = useSnapshot(clientState);
  switch (cState.v.state) {
    case 'DISCONNECTED': {
      return <div>Connecting...</div>;
    }
    case 'ANONYMOUS': {
      return <UsernamePrompt />;
    }
    case 'NO_WHITEBOARD': {
      return <input type="button" value="Create whiteboard" />;
    }
    default:
      return <Editor x={canvasX} y={canvasY} />;
  }
};

export default Lifecycle;
