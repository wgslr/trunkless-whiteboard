import { proxy } from 'valtio';

export type ConnectionState =
  | {
      state: 'INITIALIZING' | 'CONNECTING' | 'ANONYMOUS';
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
      state: 'SESSION_ENDED';
      username: string;
      whiteboardId: string;
    }
  | {
      state: 'DISCONNECTED';
    };

export const clientState = proxy<{ v: ConnectionState }>({
  v: { state: 'INITIALIZING' }
});
