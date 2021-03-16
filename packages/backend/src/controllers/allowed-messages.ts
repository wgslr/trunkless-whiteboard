import { ClientToServerCase } from '../encoding';
import { WhiteboardMembership } from '../models/client-connection';

const commonWhitboardMessages: ClientToServerCase[] = [
  'createNote',
  'deleteNote',
  'lineDrawn',
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
