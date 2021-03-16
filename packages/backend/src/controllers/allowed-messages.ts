import { WhiteboardMembership } from '../models/client-connection';
import { ClientToServerMessage } from '../protocol/protocol';
import { ClientToServerCase } from './router';

const commonWhitboardMessages: ClientToServerCase[] = [
  'createNote',
  'deleteNote',
  'getAllFiguresRequest',
  'lineDrawn',
  'moveFigure',
  'updateNotePosition',
  'updateNoteText'
];

export const ALLOWED_MESSAGES: {
  [key in WhiteboardMembership]: ClientToServerCase[];
} = {
  NO_WHITEBOARD: ['joinWhiteboard', 'createWhiteboardRequest'],
  USER: commonWhitboardMessages,
  HOST: commonWhitboardMessages
};
