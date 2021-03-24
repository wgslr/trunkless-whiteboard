import { CoordNumber } from '../types';
import { coordToNumber, numberToCoord } from '../utils';

const calculatePathPoints = (
  aNum: CoordNumber,
  bNum: CoordNumber,
  penRadius: number
) => {
  const radiusSq = penRadius ** 2;

  const a = numberToCoord(aNum);
  const b = numberToCoord(bNum);

  const xDiff = b.x - a.x;
  const yDiff = b.y - a.y;
  const noOfPoints = Math.sqrt(xDiff ** 2 + yDiff ** 2);

  const xInterval = xDiff / noOfPoints;
  const yInterval = yDiff / noOfPoints;

  const coordList = [];

  for (let i = 0; i <= noOfPoints; i++) {
    const center = {
      x: Math.floor(a.x + xInterval * i),
      y: Math.floor(a.y + yInterval * i)
    };

    // check all points in a square whether they fit in a circle
    for (let dx = 0; dx <= penRadius; ++dx) {
      for (let dy = 0; dy <= penRadius; ++dy) {
        if (dx ** 2 + dy ** 2 <= radiusSq) {
          coordList.push({ x: center.x + dx, y: center.y + dy });
          coordList.push({ x: center.x + dx, y: center.y - dy });
          coordList.push({ x: center.x - dx, y: center.y + dy });
          coordList.push({ x: center.x - dx, y: center.y - dy });
        }
      }
    }
  }
  return new Set(coordList.map(coordToNumber)); // coordList includes a bunch of redundant pixels as the "radius window" traverses the canvas
};

export const calculateLinePoints = (
  aNum: CoordNumber,
  bNum: CoordNumber
): Set<CoordNumber> => {
  return calculatePathPoints(aNum, bNum, 2);
};

// This function returns the pixels to be erased between two sampled around a specified radius of a square of pixels
export const calculateErasePoints = (
  aNum: CoordNumber,
  bNum: CoordNumber
): Set<CoordNumber> => {
  return calculatePathPoints(aNum, bNum, 5);
};
