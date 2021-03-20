import { makeErrorMessage, resultToMessage } from '../encoding';
import { decodeUUID } from 'encoding';
import { ClientConnection } from '../models/client-connection';
import { addWhiteboard, connectClient } from '../models/whiteboard';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';

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
    console.warn(
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
      client.setAsHost(addWhiteboard(client));
      const response = resultToMessage({ result: 'success' });
      client.send(response, message.messsageId);
      break;
    }
    case 'joinWhiteboard': {
      const whiteboardId = decodeUUID(message.body.joinWhiteboard.whiteboardId);
      console.log(`Client wants to join whiteboard ${whiteboardId}`);
      const result = connectClient(client, whiteboardId);

      const response = resultToMessage(result);
      client.send(response, message.messsageId);
      break;
    }
    default: {
      console.warn('Unhandled message type:', message.body.$case);
      client.send(makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR));
    }
  }
};
