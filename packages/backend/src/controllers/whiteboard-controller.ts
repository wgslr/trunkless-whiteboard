import { decodeUUID } from 'encoding';
import {
  makeErrorMessage,
  makeSuccessMessage,
  messageToLine,
  messageToNote
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
      message.messsageId
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
          data: { line: decodedData, causedBy: message.messsageId }
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
          data: { causedBy: message.messsageId, change: { id, points } }
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
          data: { causedBy: message.messsageId, change: { id, points } }
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
          data: { causedBy: message.messsageId, lineId: id }
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
          data: { note: data, causedBy: message.messsageId }
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
            causedBy: message.messsageId,
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
          data: { causedBy: message.messsageId, noteId: decodeUUID(noteId) }
        },
        client
      );
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
              causedBy: message.messsageId,
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
          message.messsageId
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

      client.send(makeSuccessMessage(), message.messsageId);
      break;
    }
    default: {
      logger.warn(`Unhandled message type: ${message.body.$case}`);
      client.send(makeErrorMessage(ErrorReason.INTERNAL_SERVER_ERROR));
    }
  }
};
