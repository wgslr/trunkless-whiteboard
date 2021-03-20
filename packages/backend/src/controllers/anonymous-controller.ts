import { makeErrorMessage, makeSuccessMessage } from '../encoding';
import { ClientConnection } from '../models/client-connection';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';
import logger from '../lib/logger';

/**
 * Handles messages exchanged when the client is not assigned to a whiteboard.
 */
export const handleNobodyMessage = (
  message: ClientToServerMessage,
  client: ClientConnection
) => {
  if (!message.body) {
    return;
  }
  if (client.fsm.state != 'ANONYMOUS') {
    logger.warn(
      `Hanshake message received from client with status ${client.fsm.state}`
    );
    client.send(
      makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED),
      message.messsageId
    );
    return;
  }

  switch (message.body.$case) {
    case 'clientHello': {
      client.setUsername(message.body.clientHello.username);
      client.send(makeSuccessMessage(), message.messsageId);
      break;
    }
    default: {
      logger.warn(`Unhandled message type: ${message.body.$case}`);
      client.send(
        makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR),
        message.messsageId
      );
    }
  }
};
