// Requirements done: add image, move image
// TODO add comment to image

import { v4 } from 'uuid';
import {
  makeCreateImageMessage,
  makeUpdateImagePosMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import {
  discardPatch,
  localAddImage,
  localUpdatePos
} from '../store/images';
import type { Coordinates, Img } from '../types';

export const addImage = (position: Coordinates, data: string = 'a new note') => {
    const image = { id: v4(), position, data };
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
}