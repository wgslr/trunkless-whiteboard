import { CoordNumber } from '../types';
import { coordToNumber, numberToCoord } from '../utils';

export const calculateLinePoints = (
  aNum: CoordNumber,
  bNum: CoordNumber
): Set<CoordNumber> => {
  const a = numberToCoord(aNum);
  const b = numberToCoord(bNum);
  let xDiff = b.x - a.x;
  let yDiff = b.y - a.y;

  let noOfPoints = Math.sqrt(xDiff ** 2 + yDiff ** 2); // distance between points is equal to number of pixels between points

  let xInterval = xDiff / noOfPoints;
  let yInterval = yDiff / noOfPoints;
  let coordList = [];
  for (let i = 0; i <= noOfPoints; i++) {
    coordList.push({
      x: Math.floor(a.x + xInterval * i),
      y: Math.floor(a.y + yInterval * i)
    });
  }
  return new Set(coordList.map(coordToNumber)); // coordList includes original Coords a & b
};

// This function returns the pixels to be erased between two sampled around a specified radius of a square of pixels
export const calculateErasePoints = (
  aNum: CoordNumber,
  bNum: CoordNumber
): Set<CoordNumber> => {
  const radius = 5; //px
  const radiusSq = radius ** 2;

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
    for (let dx = 0; dx <= radius; ++dx) {
      for (let dy = 0; dy <= radius; ++dy) {
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
