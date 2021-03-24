import * as uuid from 'uuid';
import type { UUID } from './types';

export const pushWhiteboardId = (whiteboardId: string) => {
  window.location.assign(`#${whiteboardId}`);
};

export const pushFrontPage = () => {
  window.location.assign(`#`);
};

export const parseWhiteboardIdFromUrl = (): UUID | null => {
  const pathname = window.location.hash;
  const maybeId = pathname.slice(1);
  if (maybeId && uuid.validate(maybeId)) {
    return maybeId;
  } else {
    return null;
  }
};
