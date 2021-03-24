import * as uuid from 'uuid';
import type { UUID } from './types';

export const pushWhiteboardId = (whiteboardId: string) => {
  window.history.pushState(null, '', `/${whiteboardId}`);
};

export const pushFrontPage = () => {
  window.history.pushState(null, '', `/`);
};

export const parseWhiteboardIdFromUrl = (): UUID | null => {
  const pathname = window.location.pathname;
  const maybeId = pathname.slice(1);
  if (maybeId && uuid.validate(maybeId)) {
    return maybeId;
  } else {
    return null;
  }
};
