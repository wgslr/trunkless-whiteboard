import { makeClientHelloMessage } from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { clientState } from '../store/auth';

export const setUsername = (username: string) => {
  const body = makeClientHelloMessage(username);

  console.log('ClientHello sent');
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
};
