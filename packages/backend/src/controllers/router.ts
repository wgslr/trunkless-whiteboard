import { makeErrorMessage } from '../encoding';
import { ClientConnection } from '../models/client-connection';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';
import { ALLOWED_MESSAGES } from './allowed-messages';
import { handleNobodyMessage as handleHandshakeMessage } from './anonymous-controller';
import { handlePreWhiteboardMessage } from './pre-whiteboard-controller';
import { handleWhiteboardMessage } from './whiteboard-controller';
import logger from '../lib/logger';

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
      client.fsm.state === 'ANONYMOUS' &&
      ALLOWED_MESSAGES.ANONYMOUS.includes($case)
    ) {
      handleHandshakeMessage(message, client);
    } else if (
      client.fsm.state === 'NO_WHITEBOARD' &&
      ALLOWED_MESSAGES.NO_WHITEBOARD.includes($case)
    ) {
      handlePreWhiteboardMessage(message, client);
    } else if (
      (client.fsm.state === 'USER' && ALLOWED_MESSAGES.USER.includes($case)) ||
      (client.fsm.state === 'HOST' && ALLOWED_MESSAGES.HOST.includes($case))
    ) {
      handleWhiteboardMessage(message, client);
    } else {
      logger.warn(
        `Invalid client status (${client.fsm.state}) or message type (${message.body.$case})`
      );
      client.send(
        makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED),
        message.messageId
      );
    }
  } catch (error) {
    logger.error(`Dispatch caught error: ${error}`, error);
    client.send(
      makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR),
      message.messageId
    );
  }
};
