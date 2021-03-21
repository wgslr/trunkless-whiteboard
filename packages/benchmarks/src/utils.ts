export const isNotNullsih = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  /** A type predicate */
  return value !== null && value !== undefined;
};

export const removeNullish = <T>(array: (T | null | undefined)[]): T[] =>
  array.filter(isNotNullsih);
