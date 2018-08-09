/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ascending, bisector } from 'd3-array';

export interface TimeKey {
  time: number;
  tiebreaker: number;
  gid?: string;
}

export type Comparator = (firstValue: any, secondValue: any) => number;

export const isTimeKey = (value: any): value is TimeKey =>
  value &&
  typeof value === 'object' &&
  typeof value.time === 'number' &&
  typeof value.tiebreaker === 'number';

export function compareTimeKeys(
  firstKey: TimeKey,
  secondKey: TimeKey,
  compareValues: Comparator = ascending
): number {
  const timeComparison = compareValues(firstKey.time, secondKey.time);

  if (timeComparison === 0) {
    const tiebreakerComparison = compareValues(firstKey.tiebreaker, secondKey.tiebreaker);

    if (
      tiebreakerComparison === 0 &&
      typeof firstKey.gid !== 'undefined' &&
      typeof secondKey.gid !== 'undefined'
    ) {
      return compareValues(firstKey.gid, secondKey.gid);
    }

    return tiebreakerComparison;
  }

  return timeComparison;
}

export const compareToTimeKey = <Value>(
  keyAccessor: (value: Value) => TimeKey,
  compareValues?: Comparator
) => (value: Value, key: TimeKey) => compareTimeKeys(keyAccessor(value), key, compareValues);

export const getAtTimeKey = <Value>(
  keyAccessor: (value: Value) => TimeKey,
  compareValues?: Comparator
) => {
  const compator = compareToTimeKey(keyAccessor, compareValues);
  const collectionBisector = bisector(compator);

  return (collection: Value[], key: TimeKey): Value | undefined => {
    const index = collectionBisector.left(collection, key);

    if (index >= collection.length) {
      return;
    }

    if (compator(collection[index], key) !== 0) {
      return;
    }

    return collection[index];
  };
};