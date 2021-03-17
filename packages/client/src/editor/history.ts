import { Line, UUID, CoordNumber } from '../types';
import { addPointsToLine, deleteLine } from '../controllers/line-controller';
import { LineStyle } from '@material-ui/icons';

export type Action =
  | {
      type: 'DRAWN_LINE';
      lineId: Line['id'];
    }
  | {
      type: 'ERASED';
      lines: Map<UUID, Set<CoordNumber>>;
    };

export const history: Action[] = [];

export const undo = () => {
  const lastOp = history.pop();
  if (!lastOp) {
    return; // history empty
  }

  if (lastOp.type === 'DRAWN_LINE') {
    undoDraw(lastOp);
  } else {
    undoErase(lastOp);
  }
};

const undoDraw = (action: Extract<Action, { type: 'DRAWN_LINE' }>) => {
  deleteLine(action.lineId);
};

const undoErase = (action: Extract<Action, { type: 'ERASED' }>) => {
  action.lines.forEach((points, lineId) => {
    addPointsToLine(lineId, points);
  });
};
