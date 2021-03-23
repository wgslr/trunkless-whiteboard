import { decodeUUID, encodeUUID } from 'encoding';
import { makeErrorMessage, makeSuccessMessage } from '../encoding';
import { ClientConnection } from '../models/client-connection';
import { getWhiteboard } from '../models/whiteboard';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';
import logger from '../lib/logger';

/**
 * Handles messages exchanged when the client is not assigned to a whiteboard.
 */
export const handlePreWhiteboardMessage = (
  message: ClientToServerMessage,
  client: ClientConnection
) => {
  if (!message.body) {
    return;
  }
  if (client.fsm.state != 'NO_WHITEBOARD') {
    logger.warn(
      `whiteboard-related message received from client with status ${client.fsm.state}`
    );
    client.send(
      makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED),
      message.messageId
    );
    return;
  }

  // TODO  improve handling of those messages
  switch (message.body.$case) {
    case 'createWhiteboardRequest': {
      const whiteboard = client.becomeHost();
      client.send(
        {
          $case: 'whiteboardCreated',
          whiteboardCreated: {
            whiteboardId: encodeUUID(whiteboard.id)
          }
        },
        message.messageId
      );
      whiteboard.sendCurrentClientList();
      break;
    }
    case 'joinWhiteboard': {
      const whiteboardId = decodeUUID(message.body.joinWhiteboard.whiteboardId);
      logger.info(`Client wants to join whiteboard ${whiteboardId}`);
      const whiteboard = getWhiteboard(whiteboardId);
      if (!whiteboard) {
        logger.info(
          `Client wanted to join nonexistent whiteboard ${whiteboardId}`
        );
        client.send(
          makeErrorMessage(ErrorReason.WHITEBOARD_DOES_NOT_EXIST),
          message.messageId
        );
        return;
      }
      client.requestJoinWhiteboard(whiteboard);
      client.send(makeSuccessMessage(), message.messageId);
      break;
    }
    default: {
      logger.warn(`Unhandled message type: ${message.body.$case}`);
      client.send(makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR));
    }
  }
};
