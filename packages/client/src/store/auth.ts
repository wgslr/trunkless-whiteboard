import { proxy } from 'valtio';

type ConnectionState =
  | {
      state: 'INITIALIZING';
    }
  | {
      state: 'ANONYMOUS';
    }
  | {
      state: 'NO_WHITEBOARD';
      username: string;
    }
  | {
      state: 'WHITEBOARD_USER';
      username: string;
      whitebordId: string;
    }
  | {
      state: 'WHITEBOARD_HOST';
      username: string;
      whitebordId: string;
    }
  | {
      state: 'PENDING_APPROVAL';
    }
  | {
      state: 'DISCONNECTED';
    };

export const clientState = proxy<{ v: ConnectionState }>({
  v: { state: 'INITIALIZING' }
});
