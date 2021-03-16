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
  const whiteboard = client.status.whiteboard;

  switch (message.body.$case) {
    case 'lineDrawn': {
      const data = message.body.lineDrawn;
      const decodedData = messageToLine(data);
      console.log(`Line drawn`, decodedData);

      whiteboard.handleOperation(
        {
          type: OperationType.LINE_ADD,
          data: { line: decodedData }
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
  }
};
