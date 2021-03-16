import {
  decodeUUID,
  makeErrorMessage,
  messageToLine,
  messageToNote
} from '../encoding';
import { ClientConnection } from '../models/client-connection';
import { OperationType } from '../models/whiteboard';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';

export const handleWhiteboardMessage = (
  message: ClientToServerMessage,
  client: ClientConnection
) => {
  if (!message.body) {
    return;
  }
  if (client.status.kind !== 'HOST' && client.status.kind !== 'USER') {
    client.send(makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED));
    return;
  }

  switch (message.body.$case) {
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
    case 'deleteNote': {
      const { noteId } = message.body.deleteNote;
      if (client.whiteboard) {
        client.whiteboard.handleOperation(
          {
            type: OperationType.NOTE_DELETE,
            data: { causedBy: message.messsageId, noteId: decodeUUID(noteId) }
          },
          client
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
