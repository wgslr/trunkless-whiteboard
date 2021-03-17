import fp from 'lodash/fp';
import { v4 } from 'uuid';
import type { Coordinates, Line, UUID } from '../../types';

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

const factor = 1000000;
const coordDiiff = (l: Coordinates[], r: Coordinates[]) =>
  fp.intersection(
    l.map(c => c.x * factor + c.y),
    r.map(c => c.x * factor + c.y)
  );

export const getEffectiveLine = (lt: LineTimeline): Line | null => {
  // store coords as strings to allow storage in Set
  let points = (lt.committed ? lt.committed.points : []).map(
    c => c.x * factor + c.y
  );

  for (const { diff } of lt.patches) {
    switch (diff.type) {
      case 'LINE_DELETED':
        return null;
      case 'ADD_POINTS':
        points = points.concat(diff.points.map(c => c.x * factor + c.y));
        break;
      case 'REMOVE_POINTS':
        points = fp.without(
          diff.points.map(c => c.x * factor + c.y),
          points
        );
        break;
    }
  }
  return {
    id: lt.figureId,
    points: points.map(c => ({ x: Math.floor(c / factor), y: c % factor }))
  };
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

export const patchRemovePoints = (
  lt: LineTimeline,
  points: Coordinates[]
): Result => {
  const patch = newPatch({
    type: 'REMOVE_POINTS',
    points: Object.freeze(points)
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
