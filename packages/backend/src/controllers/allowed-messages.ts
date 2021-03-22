import { ClientToServerCase } from '../encoding';
import { ClientFSMState } from '../models/client-connection';

const commonWhiteboardMessages: ClientToServerCase[] = [
  'createNote',
  'deleteNote',
  'createLine',
  'addPointsToLine',
  'removePointsFromLine',
  'deleteLine',
  'updateNotePosition',
  'updateNoteText',
  'createImage'
];

export const ALLOWED_MESSAGES: {
  /* eslint-disable-next-line no-unused-vars */
  [key in ClientFSMState]: ClientToServerCase[];
} = {
  ANONYMOUS: ['clientHello'],
  NO_WHITEBOARD: ['joinWhiteboard', 'createWhiteboardRequest'],
  PENDING_APPROVAL: [],
  USER: commonWhiteboardMessages,
  HOST: commonWhiteboardMessages.concat(['approveOrDenyJoin'])
};
