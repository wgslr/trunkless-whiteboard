import { v4 } from 'uuid';
import type { Coordinates, Line, UUID } from '../../types';

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

// export const getEffectiveLine = (lt: LineTimeline): Line | null => {
//   const current: Line = lt.committed ?? { id: lt.figureId, points: new Set() };
//   for (const { diff } of lt.patches) {
//     if (diff.type === 'LINE_DELETED') {
//       return null;
//     } else if (diff.type === 'ADD_POINTS') {
//       diff.points.forEach(p => current.points.add(p));
//     } else {
//       diff.
//     }
//   }
// };

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
