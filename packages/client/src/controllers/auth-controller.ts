import { decodeUUID } from 'encoding';
import {
  makeClientHelloMessage,
  makeCreateWhiteboardMessage,
  makeJoinWhiteboardMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { clearStores } from '../store';
import { clientState } from '../store/auth';
import { usersState } from '../store/users';

export const setUsername = (username: string) => {
  const body = makeClientHelloMessage(username);

  reqResponseService.send(body, response => {
    if (response === 'timeout') {
      // TODO display the error in the gui
      console.log('ClientHello timeout');
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
      // TODO display the error in the gui
      console.log('JoinWhiteboard timeout');
    } else if (response?.$case === 'success') {
      if (clientState.v.state !== 'NO_WHITEBOARD') {
        console.error(
          `JoinWhiteboard response received in unexpected client state: ${clientState.v.state}`
        );
        return;
      } else {
        clearStores(); // ensure no leftover from other whiteboard
        clientState.v = {
          state: 'WHITEBOARD_USER',
          username: clientState.v.username,
          whitebordId: whiteboardId
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
      // TODO display the error in the gui
      console.log('CreateWhiteboard timeout');
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
          whitebordId: decodeUUID(response.whiteboardCreated.whiteboardId)
        };
      }
    } else if (response?.$case === 'error') {
      console.log('CreateWhiteboard returned error', response.error);
    }
  });
  console.log('CreateWhiteboard sent');
};
