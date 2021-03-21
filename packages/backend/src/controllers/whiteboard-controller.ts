import { decodeUUID } from 'encoding';
import {
  makeErrorMessage,
  makeSuccessMessage,
  messageToLine,
  messageToNote,
  messageToImage
} from '../encoding';
import { ClientConnection } from '../models/client-connection';
import { OperationType } from '../models/whiteboard';
import { ClientToServerMessage, ErrorReason } from '../protocol/protocol';
import logger from '../lib/logger';

export const handleWhiteboardMessage = (
  message: ClientToServerMessage,
  client: ClientConnection
) => {
  if (!message.body) {
    return;
  }
  if (client.fsm.state !== 'HOST' && client.fsm.state !== 'USER') {
    logger.warn(
      `whiteboard-related message received from client with status ${client.fsm.state}`
    );
    client.send(
      makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED),
      message.messageId
    );
    return;
  }
  const whiteboard = client.fsm.whiteboard;

  switch (message.body.$case) {
    case 'createLine': {
      const data = message.body.createLine;
      const decodedData = messageToLine(data.line!);

      whiteboard.handleOperation(
        {
          type: OperationType.LINE_CREATE,
          data: { line: decodedData, causedBy: message.messageId }
        },
        client
      );
      return;
    }
    case 'addPointsToLine': {
      const { lineId: idRaw, points } = message.body.addPointsToLine;
      const id = decodeUUID(idRaw);

      whiteboard.handleOperation(
        {
          type: OperationType.LINE_ADD_POINTS,
          data: { causedBy: message.messageId, change: { id, points } }
        },
        client
      );
      return;
    }
    case 'removePointsFromLine': {
      const { lineId: idRaw, points } = message.body.removePointsFromLine;
      const id = decodeUUID(idRaw);

      whiteboard.handleOperation(
        {
          type: OperationType.LINE_REMOVE_POINTS,
          data: { causedBy: message.messageId, change: { id, points } }
        },
        client
      );
      return;
    }
    case 'deleteLine': {
      const { lineId } = message.body.deleteLine;
      const id = decodeUUID(lineId);
      whiteboard.handleOperation(
        {
          type: OperationType.LINE_DELETE,
          data: { causedBy: message.messageId, lineId: id }
        },
        client
      );
      return;
    }
    case 'createNote': {
      const body = message.body.createNote;
      const data = messageToNote(body.note!);

      whiteboard.handleOperation(
        {
          type: OperationType.NOTE_ADD,
          data: { note: data, causedBy: message.messageId }
        },
        client
      );
      return;
    }
    case 'updateNoteText': {
      const { noteId, text } = message.body.updateNoteText;

      whiteboard.handleOperation(
        {
          type: OperationType.NOTE_UPADTE,
          data: {
            causedBy: message.messageId,
            change: {
              id: decodeUUID(noteId),
              text
            }
          }
        },
        client
      );
      return;
    }
    case 'deleteNote': {
      const { noteId } = message.body.deleteNote;
      whiteboard.handleOperation(
        {
          type: OperationType.NOTE_DELETE,
          data: { causedBy: message.messageId, noteId: decodeUUID(noteId) }
        },
        client
      );
      return;
    }
    case 'createImage': {
      const body = message.body.createImage;
      const data = messageToImage(body.image!);
      whiteboard.handleOperation(
        {
          type: OperationType.IMG_ADD,
          data: { img: data, causedBy: message.messageId}

        },
        client
      );
      return;
    }
    case 'updateImagePosition': {
      const { imageId, position } = message.body.updateImagePosition;
      if (position === undefined) {
        client.send(makeErrorMessage(ErrorReason.OPERATION_NOT_ALLOWED)); // CHANGE TO: ErrorReason.INVALID_MESSAGE
      } else {
        whiteboard.handleOperation(
          {
            type: OperationType.IMG_MOVE,
            data: {
              causedBy: message.messageId,
              change: {
                id: decodeUUID(imageId),
                position
              }
            }
          },
          client
        );
        }
        return;
    }
    case 'updateNotePosition': {
      const { noteId, position } = message.body.updateNotePosition;
      if (position === undefined) {
        // should not happen... but typing says it could, so let's be safe
        client.send(makeErrorMessage(ErrorReason.INVALID_MESSAGE));
        return;
      } else {
        whiteboard.handleOperation(
          {
            type: OperationType.NOTE_MOVE,
            data: {
              causedBy: message.messageId,
              change: {
                id: decodeUUID(noteId),
                position
              }
            }
          },
          client
        );
      }
      break;
    }
    case 'approveOrDenyJoin': {
      const clientId = decodeUUID(message.body.approveOrDenyJoin.clientId);
      const pendingClient = whiteboard.getPendingClient(clientId);
      if (!pendingClient) {
        logger.warn(
          `Host ${client.id} attempted to accept or deny non-existing user ${clientId}`
        );
        client.send(
          makeErrorMessage(ErrorReason.USER_DOES_NOT_EXIST),
          message.messageId
        );
        return;
      }

      const isApproved = message.body.approveOrDenyJoin.approve;
      if (isApproved) {
        logger.info(`Host ${client.id} accepted user ${clientId}`);
        whiteboard.handleOperation(
          {
            type: OperationType.APPROVE_PENDING_CLIENT,
            data: {
              approvedClient: pendingClient
            }
          },
          client
        );
      } else {
        logger.info(`Host ${client.id} denied user ${clientId}`);
        whiteboard.handleOperation(
          {
            type: OperationType.DENY_PENDING_CLIENT,
            data: {
              deniedClient: pendingClient
            }
          },
          client
        );
      }

      client.send(makeSuccessMessage(), message.messageId);
      break;
    }
    default: {
      logger.warn(`Unhandled message type: ${message.body.$case}`);
      client.send(makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR));
    }
  }
};
