import React from 'react';
import { useSnapshot } from 'valtio';
import { usersState } from '../../store/users';
import { undo } from '../history';
import Canvas from './Canvas';
import Stickies from './Stickies';
import Tools from './Tools';
import UndoTool from './UndoTool';

const UserList = () => {
  const users = useSnapshot(usersState);
  return (
    <div className="userList">
      <h2>Connected users</h2>
      <ul>
        {users.joined.map(u => (
          <li key={u.id}>{u.username}</li>
        ))}
      </ul>
      <h2>Pending users</h2>
      <ul>
        {users.pending.map(u => (
          <li key={u.id}>{u.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
