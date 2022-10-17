/* eslint-disable @typescript-eslint/ban-types */
import { randomBytes } from 'crypto';

import * as Yup from 'yup';

import { Review, ReviewStatus } from '../models/Review';

interface Omit {
  <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2];
  };
}

export const omit: Omit = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: typeof obj[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }

  return ret;
};

export const mergeValidationSchemas = (...schemas: Yup.AnyObjectSchema[]) => {
  const [first, ...rest] = schemas;

  const merged = rest.reduce(
    (mergedSchemas, schema) => mergedSchemas.concat(schema),
    first
  );

  return merged;
};

export const generateUniqueId = () => {
  const numberOfBytes = 16;

  return randomBytes(numberOfBytes).toString('hex');
};

export const checkAllReviewsSubmittedOnProposal = (
  allReviews: Review[],
  currentSubmittedReview: Review
) => {
  const allOtherReviewsSubmitted = allReviews
    .filter((review) => review.id !== currentSubmittedReview.id)
    .every((review) => review.status === ReviewStatus.SUBMITTED);

  return allOtherReviewsSubmitted;
};

/**
 * @description Makes all fields non-nullable
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * @description Makes subset fields non-nullable
 */

export type NonNullableField<T, K extends keyof T> = T &
  NonNullableFields<Pick<T, K>>;

/**
 * @description Makes subset fields required
 */
export type RequiredField<T, K extends keyof T> = T &
  NonNullableFields<Required<Pick<T, K>>>;
