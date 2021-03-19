import { decodeUUID } from 'encoding';
import { ServerToClientMessage } from '../protocol/protocol';
import * as linesStore from '../store/lines';
import * as notesStore from '../store/notes';
import * as imagesStore from '../store/images';
import { decodeLineData, messageToImage, messageToNote } from './messages';

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
    case 'imageCreatedOrUpdated': {
      const imgData = messageToImage(message.body.imageCreatedOrUpdated.image!);
      imagesStore.setServerState(imgData.id, imgData);
      break;
    }
  }
};
