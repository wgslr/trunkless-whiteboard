import React, { FormEvent, useState } from 'react';
import * as authController from '../../controllers/auth-controller';
import * as uuid from 'uuid';

export const WhiteboardPrompt: React.FunctionComponent = () => {
  const [whiteboardId, setWhiteboardId] = useState('');
  const isIdValid = uuid.validate(whiteboardId);
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
          style={{ width: '36ch' }}
          maxLength={36}
          minLength={36}
          value={whiteboardId}
          onChange={e => setWhiteboardId(e.target.value)}
          autoFocus
        />
        <input
          type="submit"
          value="Join whiteboard"
          disabled={!whiteboardId || !isIdValid}
        />
        <div>{whiteboardId && !isIdValid ? 'Invalid UUID' : ''}</div>
      </form>
    </div>
  );
};

export default WhiteboardPrompt;
