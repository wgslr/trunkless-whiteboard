import { decodeUUID } from 'encoding';
import {
  makeClientHelloMessage,
  makeCreateWhiteboardMessage,
  makeJoinWhiteboardMessage,
  makeApproveOrDenyJoinMessage,
  makeLeaveWhiteboardMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { clearStores } from '../store';
import { clientState } from '../store/auth';
import { resetUsersState, usersState } from '../store/users';
import { actions as alertsActions } from '../store/alerts';
import { resetEditorState } from '../editor/state';
import { resetDrawingState } from '../editor/drawing-state';
import { clearHistory } from '../editor/history';

export const setUsername = (username: string) => {
  const body = makeClientHelloMessage(username);

  reqResponseService.send(body, response => {
    if (response === 'timeout') {
      console.log('ClientHello timeout');
      alertsActions.addAlert({
        title: 'Request timeout',
        message: 'Unable to connect to server',
        level: 'error'
      });
    } else if (response?.$case === 'success') {
      clientState.v = {
        state: 'NO_WHITEBOARD',
        username
      };
    } else if (response?.$case === 'error') {
      console.log('Client hello returned error', response.error);
    }
  });
  console.log('ClientHello sent');
};

export const joinWhiteboard = (whiteboardId: string) => {
  const body = makeJoinWhiteboardMessage(whiteboardId);

  reqResponseService.send(body, response => {
    if (response === 'timeout') {
      console.log('JoinWhiteboard timeout');
      alertsActions.addAlert({
        title: 'Request timeout',
        message: 'Unable to join whiteboard',
        level: 'error'
      });
    } else if (response?.$case === 'success') {
      if (clientState.v.state !== 'NO_WHITEBOARD') {
        console.error(
          `JoinWhiteboard response received in unexpected client state: ${clientState.v.state}`
        );
        return;
      } else {
        clientState.v = {
          state: 'PENDING_APPROVAL',
          username: clientState.v.username,
          whiteboardId
        };
      }
    } else if (response?.$case === 'error') {
      console.log('JoinWhiteboard returned error', response.error);
    }
  });
  console.log('JoinWhiteboard sent');
};

export const createWhiteboard = () => {
  const body = makeCreateWhiteboardMessage();

  reqResponseService.send(body, response => {
    if (response === 'timeout') {
      console.log('CreateWhiteboard timeout');
      alertsActions.addAlert({
        title: 'Request timeout',
        message: 'Unable to create whiteboard',
        level: 'error'
      });
    } else if (response?.$case === 'whiteboardCreated') {
      if (clientState.v.state !== 'NO_WHITEBOARD') {
        console.error(
          `CreateWhiteboard response received in unexpected client state: ${clientState.v.state}`
        );
        return;
      } else {
        clearStores(); // ensure no leftover from other whiteboard
        clientState.v = {
          state: 'WHITEBOARD_HOST',
          username: clientState.v.username,
          whiteboardId: decodeUUID(response.whiteboardCreated.whiteboardId)
        };
      }
    } else if (response?.$case === 'error') {
      console.log('CreateWhiteboard returned error', response.error);
    }
  });
  console.log('CreateWhiteboard sent');
};

export const approveUser = (clientId: string) => {
  const body = makeApproveOrDenyJoinMessage(true, clientId);

  reqResponseService.send(body, response => {
    if (response === 'timeout') {
      console.log('ApproveUser timeout');
      alertsActions.addAlert({
        title: 'Request timeout',
        message: 'No response from server for user join approval',
        level: 'error'
      });
    } else if (response?.$case === 'success') {
      usersState.pending = usersState.pending.filter(
        user => user.id !== clientId
      );
      // Joined users gets updated from multicast
    } else if (response?.$case === 'error') {
      console.log('ApproveUser returned error', response.error);
    }
  });
  console.log('ApproveUser sent');
};

export const denyUser = (clientId: string) => {
  const body = makeApproveOrDenyJoinMessage(false, clientId);

  reqResponseService.send(body, response => {
    if (response === 'timeout') {
      console.log('DenyUser timeout');
      alertsActions.addAlert({
        title: 'Request timeout',
        message: 'No response from server for user join denial',
        level: 'error'
      });
    } else if (response?.$case === 'success') {
      usersState.pending = usersState.pending.filter(
        user => user.id !== clientId
      );
    } else if (response?.$case === 'error') {
      console.log('DenyUser returned error', response.error);
    }
  });
  console.log('DenyUser sent');
};

export const leaveWhiteboard = () => {
  // also handles the user clicking 'exit' after the session has been ended by host
  if (
    clientState.v.state === 'WHITEBOARD_HOST' ||
    clientState.v.state === 'WHITEBOARD_USER' ||
    clientState.v.state === 'SESSION_ENDED'
  ) {
    if (clientState.v.state !== 'SESSION_ENDED') {
      const body = makeLeaveWhiteboardMessage();
      reqResponseService.send(body);
    }
    clientState.v = {
      state: 'NO_WHITEBOARD',
      username: clientState.v.username
    };
  }
  resetGlobalState();
};

export const resetGlobalState = () => {
  clearStores();
  resetEditorState();
  resetUsersState();
  resetDrawingState();
  clearHistory();
};
