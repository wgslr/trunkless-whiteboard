import { updateImages as updateImgStore } from '.';
import { Coordinates } from '../protocol/protocol';
import { Img, UUID } from '../types';
import * as imgTimeline from './timelines/image';
import {
  patchPos,
  newCommittedImgTimeline,
  newLocalImgTimeline,
  setCommitted
} from './timelines/image';

type PatchId = UUID;

export const localAddImage = (img: Img) => {
  return updateImgStore(imgTimelines => {
    const { timeline, figureId, patchId } = newLocalImgTimeline(img);
    imgTimelines[figureId] = timeline;
    return patchId;
  });
};

export const localUpdatePos = (id: Img['id'], newPos: Coordinates): PatchId => {
  return updateImgStore(imgTimelines => { // Continue HERERERERERE
    const oldTimeline = imgTimelines[id];
    if (!oldTimeline) {
      throw new Error('Tried updating pos of an img without a ImgTimeline');
    }
    const { patchId, timeline, figureId } = patchPos(oldTimeline, newPos);
    imgTimelines[figureId] = timeline;
    return patchId;
  });
};

export const setServerState = (id: Img['id'], state: Img | null) => {
  return updateImgStore(imgTimelines => {
    let it = imgTimelines[id];
    if (!it) {
      if (state === null) {
        // if have nothing to delete
        return;
      } else {
        it = newCommittedImgTimeline(state);
      }
    } else {
      it = setCommitted(it, state);
    }
    imgTimelines[it.figureId] = it;
  });
};

export const discardPatch = (figureId: Img['id'], patchId: PatchId) => {
  return updateImgStore(imgTimelines => {
    const it = imgTimelines[figureId];
    if (it) {
      imgTimelines[figureId] = imgTimeline.discardPatch(it, patchId);
    }
  });
};
