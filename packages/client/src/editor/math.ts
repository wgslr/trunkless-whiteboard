import { Coordinates, CoordNumber } from '../types';
import { coordToNumber, numberToCoord } from '../utils';

export function calculateLinePoints(
  aNum: CoordNumber,
  bNum: CoordNumber
): Set<CoordNumber> {
  const a = numberToCoord(aNum);
  const b = numberToCoord(bNum);
  let xDiff = b.x - a.x;
  let yDiff = b.y - a.y;

  let noOfPoints = Math.sqrt(xDiff * xDiff + yDiff * yDiff); // distance between points is equal to number of pixels between points

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
}

// This function returns the pixels to be erased between two sampled around a specified radius of a square of pixels
export function calculateErasePoints(
  aNum: CoordNumber,
  bNum: CoordNumber
): Set<CoordNumber> {
  let radius = 3; //px

  const a = numberToCoord(aNum);
  const b = numberToCoord(bNum);

  let xDiff = b.x - a.x;
  let yDiff = b.y - a.y;
  let noOfPoints = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

  let xInterval = xDiff / noOfPoints;
  let yInterval = yDiff / noOfPoints;

  let norm1 = { x: -yInterval, y: xInterval };
  let norm2 = { x: yInterval, y: -xInterval };

  let coordList = [];
  for (let i = 0; i <= noOfPoints; i++) {
    let x = Math.floor(a.x + xInterval * i);
    let y = Math.floor(a.y + yInterval * i);
    let nextPoint = { x, y };
    coordList.push({ x: x, y: y });
    for (let j = 1; j < radius; j++) {
      coordList.push({
        x: Math.floor(nextPoint.x + j * norm1.x),
        y: Math.floor(nextPoint.y + j * norm1.y)
      });
      coordList.push({
        x: Math.floor(nextPoint.x + j * norm2.x),
        y: Math.floor(nextPoint.y + j * norm2.y)
      });
    }
  }
  return new Set(coordList.map(coordToNumber)); // coordList includes a bunch of redundant pixels as the "radius window" traverses the canvas
}
