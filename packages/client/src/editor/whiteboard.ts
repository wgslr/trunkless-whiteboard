import { v5 } from 'uuid';
import { lineToMessage } from '../connection/messages';
import { reqResponseService } from '../connection/ServerContext';
import { Action, Coordinates, Img, Line, UUID } from '../types';
import { erasePoints, linePoints } from './math';
import * as R from 'ramda';
import { addLine, addPointsToLine } from '../controllers/line-controller';

export const lines: Line[] = [];

export const history: Action[] = [];

export const images: Img[] = [];

let drawing = false;
let erasing = false;

let lastPos: Coordinates | null = null;
let eraseBuffer: Coordinates[] = [];
let erasedPixels: Map<UUID, Coordinates[]> = new Map<UUID, Coordinates[]>();

// TODO using v5 is temporary; generate random v4 UUIDs
const UUID_NAMESPACE = '940beed9-f057-4088-a714-a9f5f2fc6052';

export const startLine = (point: Coordinates) => {
  drawing = true;
  const newLine = addLine([point]);
  lines.push(newLine);
  lastPos = point;
};

export const appendLine = (point: Coordinates) => {
  if (!drawing) {
    return;
  }
  let newPoints = linePoints(lastPos!, point);

  addPointsToLine(lines[lines.length - 1].id, newPoints);
  lastPos = point;
};

export const finishLine = () => {
  history.push({
    type: 'draw',
    id: lines[lines.length - 1].id
  });
  drawing = false;

  // TODO send update request to server
  // reqResponseService.send(lineToMessage(lines[lines.length - 1]));
};

export const startErase = (point: Coordinates) => {
  erasing = true;
  eraseBuffer = [];
  erasedPixels = new Map<UUID, Coordinates[]>();
  //eraseIndex++;
  eraseBuffer.push(point);
  lastPos = point;
};

export const appendErase = (point: Coordinates) => {
  if (!erasing) {
    return;
  }
  eraseBuffer = [];
  let list = erasePoints(lastPos!, point);
  for (let i = 0; i < list.length; i++) {
    eraseBuffer.push(list[i]);
  }
  updateErase();
  lastPos = point;
};

const updateErase = () => {
  eraseBuffer.map(coord => {
    lines.map(line => {
      // work on a copy, so that splice doesn't break iteration
      [...line.points].forEach(point => {
        if (coord.x == point.x && coord.y == point.y) {
          const index = R.indexOf(point, line.points);
          if (index >= 0) {
            line.points.splice(index, 1);
          }
          // line.points = R.reject(p => p == point, line.points); // This pixel will not be rendered anymore
          if (!erasedPixels.has(line.id)) {
            erasedPixels.set(line.id, [coord]); // and the erased pixel is added by UUID to erasedPixels...
          } else {
            let erasedCoords = erasedPixels.get(line.id);
            erasedCoords!.push(coord);
          }
        }
      });
    });
  });
};

export const finishErase = () => {
  if (!erasing) {
    return;
  }
  history.push({
    type: 'erase',
    lines: erasedPixels
  });
  erasing = false;

  // TODO send update request to server
};

export const undo = () => {
  if (history.length == 0) {
    return;
  }
  const findFunction = (a: string, b: string) => a == b;
  let lastAction = history[history.length - 1];

  if (lastAction.type == 'draw') {
    let id = lastAction.id;
    let index = lines.findIndex(x => findFunction(x.id, id));
    if (index != -1) {
      lines.splice(index, 1);
    }

    history.pop();

    // TODO send update to server
  } else if (lastAction.type == 'erase') {
    lastAction.lines.forEach((modifiedPixels, uuid) => {
      let index = lines.findIndex(x => findFunction(uuid, x.id));
      if (index != -1) {
        lines[index].points = R.union(lines[index].points, modifiedPixels);
      }
    });
    history.pop();
  }
};
