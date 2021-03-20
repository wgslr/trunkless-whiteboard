import { decodeUUID } from 'encoding';
import { errorReasonToJSON, ServerToClientMessage } from '../protocol/protocol';
import { clientState } from '../store/auth';
import * as linesStore from '../store/lines';
import * as notesStore from '../store/notes';
import { usersState } from '../store/users';
import { decodeLineData, messageToNote } from './messages';

export const handleConnected = () => {
  clientState.v = { state: 'ANONYMOUS' };
};

export const handleDisconnected = () => {
  clientState.v = { state: 'DISCONNECTED' };
};

export const handleMessage = (message: ServerToClientMessage): void => {
  console.log(`Received message: ${message.body?.$case}`);
  console.debug(`Received message body:`, message.body);
  switch (message.body?.$case) {
    case 'lineCreatedOrUpdated': {
      const lineData = decodeLineData(message.body.lineCreatedOrUpdated.line!);
      linesStore.setServerState(lineData.id, lineData);
      break;
    }
    case 'lineDeleted': {
      const id = decodeUUID(message.body.lineDeleted.lineId);
      linesStore.setServerState(id, null);
      break;
    }
    case 'noteCreatedOrUpdated': {
      const noteData = messageToNote(message.body.noteCreatedOrUpdated.note!);
      notesStore.setServerState(noteData.id, noteData);
      break;
    }
    case 'noteDeleted': {
      const id = decodeUUID(message.body.noteDeleted.noteId);
      notesStore.setServerState(id, null);
      break;
    }
    case 'clientWantsToJoin': {
      const user = {
        id: decodeUUID(message.body.clientWantsToJoin.clientId),
        username: message.body.clientWantsToJoin.username
      };
      usersState.pending.push(user);
      break;
    }
    case 'joinApproved': {
      if (clientState.v.state === 'PENDING_APPROVAL') {
        clientState.v = {
          state: 'WHITEBOARD_USER',
          username: clientState.v.username,
          whiteboardId: clientState.v.whiteboardId
        };
      } else {
        console.warn('Received join approval in non-pending state');
      }
      break;
    }
    case 'error': {
      const reason = errorReasonToJSON(message.body.error.reason);
      console.warn('Server responded with error:', reason);
      break;
    }
  }
};
