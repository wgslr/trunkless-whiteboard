import { updateLineStore } from '.';
import { Coordinates } from '../protocol/protocol';
import { Line, UUID } from '../types';
import * as lineTimeline from './timelines/line';
import { newLocalLineTimeline } from './timelines/line';

type PatchId = UUID;

export const localAddLine = (line: Line) => {
  return updateLineStore(lineTimelines => {
    const { timeline, figureId, patchId } = newLocalLineTimeline(line);
    lineTimelines[figureId] = timeline;
    return patchId;
  });
};

export const localAddPoints = (
  id: Line['id'],
  points: Line['points']
): PatchId => {
  return updateLineStore(lineTimelines => {
    const oldTimeline = lineTimelines[id];
    if (!oldTimeline) {
      throw new Error('Tried updating points of a line without a LineTimeline');
    }
    const { patchId, timeline, figureId } = lineTimeline.patchAddPoints(
      oldTimeline,
      points
    );
    lineTimelines[figureId] = timeline;
    return patchId;
  });
};

export const localRemovePoints = (
  id: Line['id'],
  points: Line['points']
): PatchId => {
  return updateLineStore(lineTimelines => {
    const oldTimeline = lineTimelines[id];
    if (!oldTimeline) {
      throw new Error('Tried updating points of a line without a LineTimeline');
    }
    const { patchId, timeline, figureId } = lineTimeline.patchRemovePoints(
      oldTimeline,
      points
    );
    lineTimelines[figureId] = timeline;
    return patchId;
  });
};

export const setServerState = (id: Line['id'], state: Line | null) => {
  return updateLineStore(lineTimelines => {
    let lt = lineTimelines[id];
    if (!lt) {
      if (state === null) {
        // if have nothing to delete
        return;
      } else {
        lt = lineTimeline.newCommittedLineTimeline(state);
      }
    } else {
      lt = lineTimeline.setCommitted(lt, state);
    }
    lineTimelines[lt.figureId] = lt;
  });
};

export const discardPatch = (figureId: Line['id'], patchId: PatchId) => {
  return updateLineStore(lineTimelines => {
    const nt = lineTimelines[figureId];
    if (nt) {
      lineTimelines[figureId] = lineTimeline.discardPatch(nt, patchId);
    }
  });
};
