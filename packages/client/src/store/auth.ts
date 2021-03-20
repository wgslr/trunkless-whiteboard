import { proxy } from 'valtio';

type ConnectionState =
  | {
      state: 'DISCONNECTED';
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
    };

export const clientState = proxy<{ v: ConnectionState }>({
  v: { state: 'DISCONNECTED' }
});
