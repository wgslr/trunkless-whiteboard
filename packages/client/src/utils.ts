import { Coordinates, CoordNumber } from './types';

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
  coords.x * LARGER_THAN_ANY_CANVAS + coords.y;
export const numberToCoord = (num: CoordNumber): Coordinates => {
  let y = num % LARGER_THAN_ANY_CANVAS;
  let x = (num - y) / LARGER_THAN_ANY_CANVAS;
  return { x, y };
};
