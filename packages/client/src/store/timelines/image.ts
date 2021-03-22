import { v4 } from 'uuid';
import type { Img, Coordinates, UUID } from '../../types';

// TODO functions below should probably validate
// that after 'deleted' there can't be newer patches
type Diff = Partial<Omit<Img, 'id'>>;

type Patch = {
  id: UUID;
  diff: Diff;
};

type Result = {
  timeline: ImgTimeline;
  patchId: Patch['id'];
  figureId: UUID;
};

export type ImgTimeline = {
  figureId: UUID;
  committed: Img | null;
  patches: Patch[];
};

const newPatch = (diff: Diff): Patch => ({
  id: v4(),
  diff
});

export const getEffectiveImg = (it: ImgTimeline): Img | null => {
  // Flattens information about the image, going from newest patch to oldest

  const current: Partial<Img> = { id: it.figureId };
  const patchesReverse = [...it.patches.map(p => p.diff)].reverse();
  if (it.committed) {
    patchesReverse.push(it.committed); // lowest priority
  }

  for (const diff of patchesReverse) {
    if (diff.data !== undefined && current.data === undefined) {
      current.data = diff.data;
    }

    if (diff.position !== undefined && current.position === undefined) {
      current.position = diff.position;
    }

    if (diff.zIndex !== undefined && current.zIndex === undefined) {
      current.zIndex = diff.zIndex;
    }

    if (
      current.position !== undefined &&
      current.data !== undefined &&
      current.zIndex !== undefined
    ) {
      console.debug(
        `Processed image '${current.id}' timeline with ${
          it.committed ? 'non-null' : 'null'
        } commited state and ${it.patches.length} patches`
      );
      return current as Img;
    }
  }
  return null;
};

export const newCommittedImgTimeline = (initial: Img): ImgTimeline => ({
  figureId: initial.id,
  committed: initial,
  patches: []
});

export const newLocalImgTimeline = (initial: Img): Result => {
  const patch = newPatch(initial);
  const imgTimeline: ImgTimeline = {
    figureId: initial.id,
    committed: null,
    patches: [patch]
  };
  return {
    timeline: imgTimeline,
    patchId: patch.id,
    figureId: initial.id
  };
};

export const patchPos = (it: ImgTimeline, newPos: Coordinates): Result => {
  const patch = newPatch({ position: newPos });
  const timeline = {
    ...it,
    patches: it.patches.concat(patch)
  };
  return {
    figureId: it.figureId,
    patchId: patch.id,
    timeline
  };
};

export const setCommitted = (
  it: ImgTimeline,
  committed: ImgTimeline['committed']
): ImgTimeline => ({
  ...it,
  committed
});

export const discardPatch = (
  it: ImgTimeline,
  changeId: Patch['id']
): ImgTimeline => ({
  ...it,
  patches: it.patches.filter(p => p.id !== changeId)
});
