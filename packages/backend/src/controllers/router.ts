import {
  decodeUUID,
  makeErrorMessage,
  messageToLine,
  messageToNote,
  resultToMessage
} from '../encoding';
import { ClientConnection } from '../models/client-connection';
import {
  addWhiteboard,
  connectClient,
  OperationType,
  Whiteboard
} from '../models/whiteboard';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';
import { ALLOWED_MESSAGES } from './allowed-messages';

export type ClientToServerCase = NonNullable<
  ClientToServerMessage['body']
>['$case'];

const handlePreWhiteboardMessage = (
  message: ClientToServerMessage,
  client: ClientConnection
) => {
  if (!message.body) {
    return;
  }
  if (client.status.kind != 'NO_WHITEBOARD') {
    client.send(makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED));
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

const handleWhiteboardMessage = (
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

export const dispatch = (
  message: ClientToServerMessage,
  client: ClientConnection
): void => {
  if (!message.body || !message.body.$case) {
    return;
  }

  const $case = message.body?.$case;

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
};
