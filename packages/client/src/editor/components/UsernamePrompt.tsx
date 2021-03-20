import React, { FormEvent, useState } from 'react';
import * as authController from '../../controllers/auth-controller';

export const UsernamePrompt: React.FunctionComponent = () => {
  const [username, setUsername] = useState('');
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.length > 0) {
      authController.setUsername(username);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input type="submit" value="Set username" />
      </form>
    </div>
  );
};

export default UsernamePrompt;
