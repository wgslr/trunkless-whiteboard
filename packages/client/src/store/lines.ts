import { store } from '.';
import { Coordinates } from '../protocol/protocol';
import { Line, UUID } from '../types';
import * as lineTimeline from './timelines/line';
import { newLocalLineTimeline } from './timelines/line';

type PatchId = UUID;

export const localAddLine = (line: Line) => {
  const { timeline, figureId, patchId } = newLocalLineTimeline(line);
  store.lineTimelines[figureId] = timeline;
  return patchId;
};

export const localAddPoints = (
  id: Line['id'],
  points: Line['points']
): PatchId => {
  const oldTimeline = store.lineTimelines[id];
  if (!oldTimeline) {
    throw new Error('Tried updating text of a line without a LineTimeline');
  }
  const { patchId, timeline, figureId } = lineTimeline.patchAddPoints(
    oldTimeline,
    points
  );
  store.lineTimelines[figureId] = timeline;
  return patchId;
};

export const discardPatch = (figureId: Line['id'], patchId: PatchId) => {
  let nt = store.lineTimelines[figureId];
  if (nt) {
    store.lineTimelines[figureId] = lineTimeline.discardPatch(nt, patchId);
  }
};
