import { ClientToServerCase } from '../encoding';
import { ClientFSMState } from '../models/client-connection';

const commonWhitboardMessages: ClientToServerCase[] = [
  'createNote',
  'deleteNote',
  'createLine',
  'addPointsToLine',
  'removePointsFromLine',
  'deleteLine',
  'updateNotePosition',
  'updateNoteText'
];

export const ALLOWED_MESSAGES: {
  [key in ClientFSMState]: ClientToServerCase[];
} = {
  ANONYMOUS: ['clientHello'],
  NO_WHITEBOARD: ['joinWhiteboard', 'createWhiteboardRequest'],
  USER: commonWhitboardMessages,
  HOST: commonWhitboardMessages
};
