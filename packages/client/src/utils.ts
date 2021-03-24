import { Coordinates, CoordNumber } from './types';
import fp from 'lodash/fp';
import { SCALE_FACTOR } from './config';

export function isNotNullsih<TValue>(
  value: TValue | null | undefined
): value is TValue {
  /** A type predicate */
  return value !== null && value !== undefined;
}

export const removeNullish = <T>(array: (T | null | undefined)[]): T[] =>
  array.filter(isNotNullsih);

const LARGER_THAN_ANY_CANVAS = 1000000;
export const coordToNumber = (coords: Coordinates): CoordNumber =>
  Math.floor(coords.x) * LARGER_THAN_ANY_CANVAS + Math.floor(coords.y);
export const numberToCoord = (num: CoordNumber): Coordinates => {
  const y = num % LARGER_THAN_ANY_CANVAS;
  const x = (num - y) / LARGER_THAN_ANY_CANVAS;
  return { x, y };
};

export const setUnion = <T>(left: Set<T>, right: Set<T>) =>
  new Set([...left, ...right]);

export const setDifference = <T>(left: Set<T>, right: Set<T>) =>
  new Set([...left].filter(x => !right.has(x)));

export const setIntersection = <T>(left: Set<T>, right: Set<T>) => {
  const [larger, smaller] =
    left.size > right.size ? [left, right] : [right, left];
  return new Set([...smaller].filter(x => larger.has(x)));
};

export const scaleDisplayCoordToVirtual = ({
  x,
  y
}: Coordinates): Coordinates => ({
  x: Math.floor(x / SCALE_FACTOR),
  y: Math.floor(y / SCALE_FACTOR)
});

export const scaleVirtualCoordToDisplay = ({
  x,
  y
}: Coordinates): Coordinates => ({
  x: Math.floor(x * SCALE_FACTOR),
  y: Math.floor(y * SCALE_FACTOR)
});
