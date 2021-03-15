import {
  decodeUUID,
  messageToLine,
  messageToNote,
  noteToMessage,
  resultToMessage
} from '../encoding';
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
          $case: 'getAllFiguresResponse',
          getAllFiguresResponse: {
            // @ts-ignore: FIXME Figure and Note are not overlapping
            notes: [...client.whiteboard.figures.values()].map(encodeNote)
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
      client.send(response, message.messsageId);
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
        client.whiteboard.handleOperation(
          {
            type: OperationType.LINE_ADD,
            data: { line: decodedData }
          },
          client
        );
      } else {
        console.warn(
          'Received LineDrawn message from client not connected to a whiteboard'
        );
      }

      break;
    }
    case 'createNote': {
      const body = message.body.createNote;
      const data = messageToNote(body.note!);

      if (client.whiteboard) {
        client.whiteboard.handleOperation(
          {
            type: OperationType.NOTE_ADD,
            data: { note: data, causedBy: message.messsageId }
          },
          client
        );
      } else {
        console.warn(
          'Received createNote message from client not connected to a whiteboard'
        );
        // TODO return error
      }

      break;
    }
    case 'updateNoteText': {
      const { noteId, text } = message.body.updateNoteText;

      if (client.whiteboard) {
        client.whiteboard.handleOperation(
          {
            type: OperationType.NOTE_UPADTE,
            data: {
              causedBy: message.messsageId,
              change: {
                id: decodeUUID(noteId),
                text
              }
            }
          },
          client
        );
      } else {
        // TODO return error
      }
      break;
    }
    default: {
      // TODO send error about unrecognized message
      break;
    }
  }
};
