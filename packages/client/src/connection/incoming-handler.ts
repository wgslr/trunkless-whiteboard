import { decodeUUID } from 'encoding';
import { resetEditorState } from '../editor/state';
import {
  errorReasonToJSON,
  ServerToClientMessage,
  User as UserProto
} from '../protocol/protocol';
import { clearStores } from '../store';
import { actions as alertsActions } from '../store/alerts';
import { clientState } from '../store/auth';
import * as imagesStore from '../store/images';
import * as linesStore from '../store/lines';
import * as notesStore from '../store/notes';
import { usersState } from '../store/users';
import { decodeLineData, messageToImage, messageToNote } from './messages';

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
    case 'imageCreated': {
      const imgData = messageToImage(message.body.imageCreated.image!);
      imagesStore.setServerState(imgData.id, imgData);
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
    case 'joinDenied': {
      if (clientState.v.state === 'PENDING_APPROVAL') {
        clientState.v = {
          state: 'NO_WHITEBOARD',
          username: clientState.v.username
        };
        alertsActions.addAlert({
          title: 'Entry denied',
          message: 'The host denied your entry to the whiteboard',
          level: 'warning'
        });
      } else {
        console.warn('Received join denial in non-pending state');
      }
      break;
    }
    case 'userListChanged': {
      const data = message.body.userListChanged;
      const parseUser = (connectedClient: UserProto) => ({
        username: connectedClient.username,
        id: decodeUUID(connectedClient.clientId)
      });
      usersState.present = data.present.map(parseUser);
      usersState.past = data.past.map(parseUser);
      break;
    }
    case 'whiteboardSessionEnded': {
      handleSessionEnded();
      break;
    }
    case 'error': {
      const reason = errorReasonToJSON(message.body.error.reason);
      console.warn('Server responded with error:', reason);
      break;
    }
  }
};

const handleSessionEnded = () => {
  if (
    clientState.v.state !== 'WHITEBOARD_USER' &&
    clientState.v.state !== 'WHITEBOARD_HOST'
  ) {
    console.info(
      'Received whiteboard session end notification in non-whiteboard state'
    );
    return;
  }
  clientState.v = {
    ...clientState.v,
    state: 'SESSION_ENDED'
  };
  resetEditorState();
};
