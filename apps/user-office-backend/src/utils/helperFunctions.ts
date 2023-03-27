import { randomBytes } from 'crypto';

import * as Yup from 'yup';

import { BasicResolverContext } from '../context';
import { Review, ReviewStatus } from '../models/Review';
import { OmitType } from './utilTypes';

export const omit: OmitType = (obj, ...keys) => {
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

export const searchObjectByKey = (
  object: object,
  originalKey: string
): object | null => {
  if (object !== null) {
    for (const key of Object.keys(object)) {
      if (key === originalKey) {
        return object;
      } else if (typeof object[key as keyof object] === 'object') {
        const found = searchObjectByKey(
          object[key as keyof object],
          originalKey
        );

        if (found !== null) {
          return found;
        }
      }
    }
  }

  return null;
};

export function removeDuplicates<T>(obj: T): T {
  if (Array.isArray(obj) && obj.length > 1) {
    return obj.reduce(function (carrResult, currValue) {
      return carrResult.includes(currValue)
        ? carrResult
        : [...carrResult, currValue];
    }, []);
  }

  return obj;
}

export function getContextKeys(
  context: BasicResolverContext,
  typeOfKey: keyof BasicResolverContext
) {
  const arrayOfKeys: string[] = [];
  Object.keys(context[typeOfKey]).forEach((key) => {
    const element = (context[typeOfKey] as never)[key];

    const proto = Object.getPrototypeOf(element);
    // NOTE: For now all admin mutations are excluded for security reasons.
    if (
      typeOfKey === 'mutations' &&
      proto.constructor.name.startsWith('Admin')
    ) {
      return;
    }
    const names = Object.getOwnPropertyNames(proto).filter((item) =>
      typeOfKey === 'queries' ? item.startsWith('get') : item !== 'constructor'
    );

    const classNamesWithMethod = names.map(
      (item) => `${proto.constructor.name}.${item}`
    );

    arrayOfKeys.push(...classNamesWithMethod);
  });

  return arrayOfKeys;
}
