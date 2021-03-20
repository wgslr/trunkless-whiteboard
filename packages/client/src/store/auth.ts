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
      state: 'WHITEBOARD';
      username: string;
      whitebordId: string;
    }
  | {
      state: 'DISCONNECTED';
    };

export const clientState = proxy<{ v: ConnectionState }>({
  v: { state: 'INITIALIZING' }
});
