import React from 'react';
import { useSnapshot } from 'valtio';
import { usersState, User } from '../../store/users';
import Button from '@material-ui/core/Button';
import AcceptIcon from '@material-ui/icons/Done';
import DenyIcon from '@material-ui/icons/Clear';

const UserDisplay = ({ user }: { user: User }) => (
  <li key={user.id}>{user.username}</li>
);

const PendingUser = ({ user }: { user: User }) => {
  return (
    <>
      <UserDisplay user={user} />
      <Button onClick={() => console.log('CLICKED')} variant="contained">
        <AcceptIcon />
      </Button>
      <Button onClick={() => console.log('CLICKED')} variant="contained">
        <DenyIcon />
      </Button>
    </>
  );
};

const UserList = () => {
  const users = useSnapshot(usersState);
  return (
    <div className="userList">
      <h2>Connected users</h2>
      <ul>
        {users.joined.map(u => (
          <UserDisplay user={u} />
        ))}
      </ul>
      <h2>Pending users</h2>
      <ul>
        {users.pending.map(u => (
          <PendingUser user={u} />
        ))}
      </ul>
    </div>
  );
};

export default UserList;
