// Requirements: add image, move image, add comment to image

import { v4 } from 'uuid';
import {
  makeCreateNoteMessage,
  makeDeleteNoteMessage,
  makeUpdateNoteTextMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import {
  discardPatch,
  localAddNote,
  localDeleteNote,
  localUpdateText
} from '../store/notes';
import type { Coordinates, Note } from '../types';