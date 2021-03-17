import { v4 } from 'uuid';
import {
  makeAddPointsToLineMessage,
  makeCreateLineMessage
} from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { ClientToServerMessage } from '../protocol/protocol';
import {
  discardPatch,
  localAddLine,
  localAddPoints,
  localRemovePoints
} from '../store/lines';
import { Line } from '../types';

export const addLine = (points: Line['points']): Readonly<Line> => {
  const line = { id: v4(), points };
  const patchId = localAddLine(line);
  const body: ClientToServerMessage['body'] = makeCreateLineMessage(line);
  reqResponseService.send(body, () => {
    discardPatch(line.id, patchId);
  });
  return { id: line.id, points: Array.from(line.points) };
};

export const addPointsToLine = (id: Line['id'], points: Line['points']) => {
  const patchId = localAddPoints(id, points);
  const body: ClientToServerMessage['body'] = makeAddPointsToLineMessage(
    id,
    points
  );
  reqResponseService.send(body, () => {
    discardPatch(id, patchId);
  });
};

export const remotePointsFromLine = (
  id: Line['id'],
  points: Line['points']
) => {
  const patchId = localRemovePoints(id, points);
  // TODO send to server
};
