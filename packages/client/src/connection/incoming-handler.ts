import { decodeUUID } from 'encoding';
import * as whiteboard from '../editor/whiteboard';
import { ServerToClientMessage } from '../protocol/protocol';
import { setServerState } from '../store/notes';
import { decodeLineData, messageToNote } from './messages';

export const handleMessage = (message: ServerToClientMessage): void => {
  // console.log(`Received message: ${message.body?.$case}`);
  // console.debug(`Received message body:`, message.body);
  switch (message.body?.$case) {
    case 'lineDrawn': {
      const lineData = decodeLineData(message.body.lineDrawn);
      // TODO encapsulate it in the whiteboard module
      // TODO ignore on the client that created the line
      // whiteboard.lines.push({ id: lineData.id, points: lineData.points });
      break;
    }
    case 'noteCreatedOrUpdated': {
      const noteData = messageToNote(message.body.noteCreatedOrUpdated.note!);
      setServerState(noteData.id, noteData);
      break;
    }
    case 'noteDeleted': {
      const id = decodeUUID(message.body.noteDeleted.noteId);
      setServerState(id, null);
    }
  }
};
