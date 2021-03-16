import { v4 } from 'uuid';
import type { Coordinates, Line, UUID } from '../../types';
import * as R from 'ramda';

// TODO functions below should probably validate
// that after 'deleted' there can't be newer patches
type Diff =
  | { type: 'LINE_DELETED' }
  | {
      type: 'ADD_POINTS';
      points: Readonly<Coordinates[]>;
    }
  | {
      type: 'REMOVE_POINTS';
      points: Readonly<Coordinates[]>;
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
  const current: Line = lt.committed ?? { id: lt.figureId, points: [] };
  for (const { diff } of lt.patches) {
    switch (diff.type) {
      case 'LINE_DELETED':
        return null;
      case 'ADD_POINTS':
        // does not preserve uniqueness, but it will be resolved
        // in the next REMOVE_POINTS or on returning
        current.points = current.points.concat(diff.points);
        break;
      case 'REMOVE_POINTS':
        current.points = R.difference(current.points, diff.points);
        break;
    }
  }

  current.points = R.uniq(current.points);
  return current;
};

export const newCommittedLineTimeline = (initial: Line): LineTimeline => ({
  figureId: initial.id,
  committed: initial,
  patches: []
});

export const newLocalLineTimeline = ({ id, points }: Line): Result => {
  const patch = newPatch({
    type: 'ADD_POINTS',
    points: Object.freeze(points)
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

export const patchAddPoints = (
  lt: LineTimeline,
  points: Coordinates[]
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
