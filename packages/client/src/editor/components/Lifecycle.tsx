import React from 'react';
import { useSnapshot } from 'valtio';
import { clientState } from '../../store/auth';
import Editor from './Editor';
import UserList from './UserList';
import UsernamePrompt from './UsernamePrompt';
import WhiteboardPrompt from './WhiteboardPrompt';

const canvasX = 800;
const canvasY = 600;

export const Lifecycle: React.FunctionComponent = () => {
  const cState = useSnapshot(clientState);
  switch (cState.v.state) {
    case 'INITIALIZING': {
      return <div>Initializing...</div>;
    }
    case 'CONNECTING': {
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
      return <Whiteboard />;
    case 'WHITEBOARD_USER':
      return <Whiteboard />;
    case 'SESSION_ENDED':
      return <Whiteboard />;
    case 'PENDING_APPROVAL':
      return <div>Pending approval from host...</div>;
  }
};

export default Lifecycle;

const Whiteboard: React.FunctionComponent = () => {
  return (
    <>
      <Editor x={canvasX} y={canvasY} />
      <UserList />
    </>
  );
};
