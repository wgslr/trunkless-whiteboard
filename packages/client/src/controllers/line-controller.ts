import { v4 } from 'uuid';
import { Coordinates } from '../protocol/protocol';
import { localAddLine } from '../store/lines';
import { Line } from '../types';

export const addLine = (points: Line['points']) => {
  const line = { id: v4(), points };
  const patchId = localAddLine(line);
  // const body: ClientToServerMessage['body'] = makeCreateNoteMessage(line);
  // reqResponseService.send(body, () => {
  //   discardPatch(line.id, patchId);
  // });
};
