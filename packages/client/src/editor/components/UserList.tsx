import React from 'react';
import { useSnapshot } from 'valtio';
import { usersState, User } from '../../store/users';
import Button from '@material-ui/core/Button';
import AcceptIcon from '@material-ui/icons/Done';
import DenyIcon from '@material-ui/icons/Clear';
import { approveUser } from '../../controllers/auth-controller';

const UserDisplay = ({ user }: { user: User }) => (
  <li>{user.username}</li>
);

const PendingUserDisplay = ({ user }: { user: User }) => {
  const handleApprove = () => approveUser(user.id);
  const handleDeny = () => console.log('DENY');
  return (
    <>
      <UserDisplay user={user} />
      <Button onClick={handleApprove} variant="contained">
        <AcceptIcon />
      </Button>
      <Button onClick={handleDeny} variant="contained">
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
          <UserDisplay key={u.id} user={u} />
        ))}
      </ul>
      <h2>Pending users</h2>
      <ul>
        {users.pending.map(u => (
          <PendingUserDisplay key={u.id} user={u} />
        ))}
      </ul>
    </div>
  );
};

export default UserList;
