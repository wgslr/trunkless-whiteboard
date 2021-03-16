import { METHODS } from 'node:http';
import { v4 } from 'uuid';
import type { Coordinates, UUID, Line } from '../../types';

// TODO functions below should probably validate
// that after 'deleted' there can't be newer patches
type Diff =
  | { type: 'LINE_DELETED' }
  | {
      type: 'ADD_POINTS';
      points: Set<Coordinates>;
    }
  | {
      type: 'REMOVE_POINTS';
      points: Set<Coordinates>;
    };

type Patch = {
  id: UUID;
  diff: Diff;
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

export const newCommittedLineTimeline = (initial: Line): LineTimeline => ({
  figureId: initial.id,
  committed: initial,
  patches: []
});

export const newLocalLineTimeline = (initial: Line): Result => {
  const patch = newPatch({
    type: 'ADD_POINTS',
    points: new Set(initial.points)
  });
  const timeline: LineTimeline = {
    figureId: initial.id,
    committed: null,
    patches: [patch]
  };
  return {
    timeline,
    patchId: patch.id,
    figureId: initial.id
  };
};

export const patchAddPoints = (
  lt: LineTimeline,
  points: Set<Coordinates>
): Result => {
  const patch = newPatch({ type: 'ADD_POINTS', points: new Set(points) });
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
