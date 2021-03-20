import { proxy } from 'valtio';
import { UUID } from '../types';

export type User = {
  id: UUID;
  username: string;
};

type UsersState = {
  joined: User[];
  pending: User[];
};

export const usersState = proxy<UsersState>({
  joined: [],
  pending: []
});
