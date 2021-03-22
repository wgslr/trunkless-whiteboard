import { v4 } from 'uuid';
import {
  makeCreateImageMessage,
  makeUpdateImagePosMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import { discardPatch, localAddImage, localUpdatePos } from '../store/images';
import type { Coordinates, Img } from '../types';

// values for local zIndex, which will later be overriden by server-assigned index
let localZIndex = 1000000;

export const addImage = (position: Coordinates, data: Uint8Array) => {
  const image: Img = { id: v4(), position, data, zIndex: localZIndex++ };
  const patchId = localAddImage(image);
  const body: ClientToServerMessage['body'] = makeCreateImageMessage(image);
  reqResponseService.send(body, () => {
    // No need to check the response.
    // If success - the change is already incorporated into
    // state sent by server. If not, discarding the patch
    // undoes the changes.
    discardPatch(image.id, patchId);
  });
};

export const updateImagePosition = (
  figureId: Img['id'],
  newPos: Coordinates
): void => {
  const patchId = localUpdatePos(figureId, newPos);
  const body: ClientToServerMessage['body'] = makeUpdateImagePosMessage(
    figureId,
    newPos
  );
  reqResponseService.send(body, () => discardPatch(figureId, patchId));
};
