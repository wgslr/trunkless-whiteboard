import { proxy } from 'valtio';
import { UUID } from '../types';

export type User = {
  id: UUID;
  username: string;
};

type UsersState = {
  past: User[];
  present: User[];
  pending: User[];
};

export const usersState = proxy<UsersState>({
  past: [],
  present: [],
  pending: []
});

export const getUsername = (
  userId: User['id'],
  state: UsersState
): string | undefined =>
  [...state.present, ...state.past].find(u => u.id === userId)?.username;

export const resetUsersState = () => {
  usersState.past = [];
  usersState.present = [];
  usersState.pending = [];
};
