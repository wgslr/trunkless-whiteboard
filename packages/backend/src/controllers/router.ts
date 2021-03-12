import { decodeUUID, messageToLine, resultToMessage } from '../encoding';
import { ClientConnection } from '../models/client-connection';
import {
  addWhiteboard,
  connectClient,
  OperationType
} from '../models/whiteboard';
import { ClientToServerMessage } from '../protocol/protocol';

export const dispatch = (
  message: ClientToServerMessage,
  client: ClientConnection
) => {
  switch (message.body?.$case) {
    case 'createWhiteboardRequest': {
      client.whiteboard = addWhiteboard(client);
      break;
    }
    case 'getAllFiguresRequest': {
      if (client.whiteboard) {
        client.send({
          body: {
            $case: 'getAllFiguresResponse',
            getAllFiguresResponse: {
              // @ts-ignore: FIXME Figure and Note are not overlapping
              notes: [...client.whiteboard.figures.values()].map(encodeNote)
            }
          }
        });
      }
      break;
    }
    case 'joinWhiteboard': {
      const whiteboardId = decodeUUID(message.body.joinWhiteboard.whiteboardId);
      console.log(`Client wants to join whiteboard ${whiteboardId}`);
      const result = connectClient(client, whiteboardId);

      const response = resultToMessage(result);
      client.send(response);
      break;
    }
    case 'moveFigure': {
      // TODO
      break;
    }
    case 'lineDrawn': {
      const data = message.body.lineDrawn;
      const decodedData = messageToLine(data);
      console.log(`Line drawn`, decodedData);

      if (client.whiteboard) {
        client.whiteboard.handleOperation({
          type: OperationType.LINE_ADD,
          data: { line: decodedData }
        });
      } else {
        console.warn(
          'Received LineDrawn message from client not connected to a whiteboard'
        );
      }

      break;
    }
    default: {
      // TODO send error about unrecognized message
      break;
    }
  }
};
