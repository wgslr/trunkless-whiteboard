import React, { FormEvent, useState } from 'react';
import * as authController from '../../controllers/auth-controller';

export const WhiteboardPrompt: React.FunctionComponent = () => {
  const [whiteboardId, setWhiteboardId] = useState('');
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    authController.createWhiteboard();
  };
  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    authController.joinWhiteboard(whiteboardId);
  };
  return (
    <div>
      <form onSubmit={handleCreate}>
        <input type="submit" value="Create whiteboard" />
      </form>
      <form onSubmit={handleJoin}>
        <input
          value={whiteboardId}
          onChange={e => setWhiteboardId(e.target.value)}
        />
        <input type="submit" value="Join whiteboard" />
      </form>
    </div>
  );
};

export default WhiteboardPrompt;
