import { v4 } from 'uuid';
import type { CoordNumber, Line, UUID } from '../../types';

// TODO functions below should probably validate
// that after 'deleted' there can't be newer patches
type Diff =
  | { type: 'LINE_DELETED' }
  | {
      type: 'ADD_POINTS';
      points: Readonly<Set<CoordNumber>>;
    }
  | {
      type: 'REMOVE_POINTS';
      points: Readonly<Set<CoordNumber>>;
    };

type Patch = {
  readonly id: UUID;
  readonly diff: Diff;
};

type Result = {
  timeline: LineTimeline;
  patchId: Patch['id'];
  figureId: UUID;
};

export type LineTimeline = {
  figureId: UUID;
  committed: Line | null;
  patches: Patch[];
};

const newPatch = (diff: Diff): Patch => ({
  id: v4(),
  diff
});

export const getEffectiveLine = (lt: LineTimeline): Line | null => {
  // store coords as strings to allow storage in Set
  let points: Set<CoordNumber> = new Set(
    lt.committed ? lt.committed.points : []
  );

  for (const { diff } of lt.patches) {
    switch (diff.type) {
      case 'LINE_DELETED':
        return null;
      case 'ADD_POINTS':
        diff.points.forEach(p => points.add(p));
        break;
      case 'REMOVE_POINTS':
        diff.points.forEach(p => points.delete(p));
        break;
    }
  }
  return { id: lt.figureId, points };
};

export const newCommittedLineTimeline = (initial: Line): LineTimeline => ({
  figureId: initial.id,
  committed: initial,
  patches: []
});

export const newLocalLineTimeline = ({ id, points }: Line): Result => {
  const patch = newPatch({
    type: 'ADD_POINTS',
    points: points
  });
  const timeline: LineTimeline = {
    figureId: id,
    committed: null,
    patches: [patch]
  };
  return {
    timeline,
    patchId: patch.id,
    figureId: id
  };
};

export const patchRemovePoints = (
  lt: LineTimeline,
  points: Line['points']
): Result => {
  const patch = newPatch({
    type: 'REMOVE_POINTS',
    points
  });
  const timeline = {
    ...lt,
    patches: lt.patches.concat(patch)
  };
  return {
    timeline,
    patchId: patch.id,
    figureId: lt.figureId
  };
};

export const patchAddPoints = (
  lt: LineTimeline,
  points: Line['points']
): Result => {
  const patch = newPatch({ type: 'ADD_POINTS', points: Object.freeze(points) });
  const timeline = {
    ...lt,
    patches: lt.patches.concat(patch)
  };
  return {
    timeline,
    patchId: patch.id,
    figureId: lt.figureId
  };
};

export const setCommitted = (
  lt: LineTimeline,
  committed: LineTimeline['committed']
): LineTimeline => ({
  ...lt,
  committed
});

export const discardPatch = (
  lt: LineTimeline,
  changeId: Patch['id']
): LineTimeline => ({
  ...lt,
  patches: lt.patches.filter(p => p.id !== changeId)
});
