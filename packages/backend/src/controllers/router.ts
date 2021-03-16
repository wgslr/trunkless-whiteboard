import { makeErrorMessage } from '../encoding';
import { ClientConnection } from '../models/client-connection';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';
import { ALLOWED_MESSAGES } from './allowed-messages';
import { handlePreWhiteboardMessage } from './pre-whiteboard-controller';
import { handleWhiteboardMessage } from './whiteboard-controller';

export const dispatch = (
  message: ClientToServerMessage,
  client: ClientConnection
): void => {
  if (!message.body || !message.body.$case) {
    return;
  }

  const $case = message.body?.$case;

  try {
    if (
      client.status.kind === 'NO_WHITEBOARD' &&
      ALLOWED_MESSAGES.NO_WHITEBOARD.includes($case)
    ) {
      handlePreWhiteboardMessage(message, client);
    } else if (
      (client.status.kind === 'USER' || client.status.kind === 'HOST') &&
      ALLOWED_MESSAGES.USER.includes($case)
    ) {
      handleWhiteboardMessage(message, client);
    } else {
      client.send(makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED));
    }
  } catch (error) {
    console.error(error);
    client.send(makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR));
  }
};
