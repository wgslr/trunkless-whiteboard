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
  if (client.status.kind != 'NO_WHITEBOARD') {
    console.warn(
      `whiteboard-related message received from client with status ${client.status.kind}`
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
      client.status = {
        kind: 'HOST',
        whiteboard: addWhiteboard(client)
      };
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
  }
};
