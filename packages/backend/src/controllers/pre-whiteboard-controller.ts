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
      message.messsageId
    );
    return;
  }

  // TODO  improve handling of those messages
  switch (message.body.$case) {
    case 'createWhiteboardRequest': {
      const whiteboardId = client.becomeHost();
      client.send(
        {
          $case: 'whiteboardCreated',
          whiteboardCreated: {
            whiteboardId: encodeUUID(whiteboardId)
          }
        },
        message.messsageId
      );
      break;
    }
    case 'joinWhiteboard': {
      const whiteboardId = decodeUUID(message.body.joinWhiteboard.whiteboardId);
      logger.info(`Client wants to join whiteboard ${whiteboardId}`);
      const whiteboard = getWhiteboard(whiteboardId);
      if (!whiteboard) {
        client.send(
          makeErrorMessage(ErrorReason.WHITEBOARD_DOES_NOT_EXIST),
          message.messsageId
        );
        return;
      }
      client.requestJoinWhiteboard(whiteboard);
      // client.send(makeSuccessMessage(), message.messsageId);
      // TODO maybe wait for request
      whiteboard.bootstrapClient(client);
      break;
    }
    default: {
      logger.warn(`Unhandled message type: ${message.body.$case}`);
      client.send(makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR));
    }
  }
};
