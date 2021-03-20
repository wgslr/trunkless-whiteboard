import React from 'react';
import { useSnapshot } from 'valtio';
import { clientState } from '../../store/auth';
import Editor from './Editor';

const canvasX = 800;
const canvasY = 600;

export const Lifecycle: React.FunctionComponent = () => {
  const cState = useSnapshot(clientState);
  return (
    <>
      {cState.v.state === 'DISCONNECTED' ? (
        'Connecting...'
      ) : (
        <Editor x={canvasX} y={canvasY} />
      )}
    </>
  );
};

export default Lifecycle;
