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
      whiteboardId: string;
    }
  | {
      state: 'WHITEBOARD_HOST';
      username: string;
      whiteboardId: string;
    }
  | {
      state: 'PENDING_APPROVAL';
      username: string;
      whiteboardId: string;
    }
  | {
      state: 'DISCONNECTED';
    };

export const clientState = proxy<{ v: ConnectionState }>({
  v: { state: 'INITIALIZING' }
});
