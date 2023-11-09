import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  anotherDummyReview,
  dummyReview,
  dummyReviews,
} from '../datasources/mockups/InternalReviewDataSource';
import {
  dummyUserWithRole,
  dummyInstrumentScientist,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import InternalReviewQueries from './InternalReviewQueries';

const internalReviewQueries = container.resolve(InternalReviewQueries);

test('A user can not get an internal review', () => {
  return expect(internalReviewQueries.get(dummyUserWithRole, 1)).resolves.toBe(
    null
  );
});

test('A not logged in user can not get an internal review', () => {
  return expect(internalReviewQueries.get(null, 1)).resolves.toBe(null);
});

test('Instrument scientist can get internal review on their instrument', () => {
  return expect(
    internalReviewQueries.get(dummyInstrumentScientist, 1)
  ).resolves.toStrictEqual(dummyReview);
});

test('User officer can get any internal review', () => {
  return expect(
    internalReviewQueries.get(dummyUserOfficerWithRole, 2)
  ).resolves.toStrictEqual(anotherDummyReview);
});

test('A user can not get all internal reviews', () => {
  return expect(internalReviewQueries.getAll(dummyUserWithRole)).resolves.toBe(
    null
  );
});

test('A not logged in user can not get all internal reviews', () => {
  return expect(internalReviewQueries.getAll(null)).resolves.toBe(null);
});

test('Instrument scientist can get internal reviews on their instrument', () => {
  return expect(
    internalReviewQueries.getAll(dummyInstrumentScientist, {
      technicalReviewId: 1,
    })
  ).resolves.toStrictEqual(dummyReviews);
});

test('User officer can get all internal reviews', () => {
  return expect(
    internalReviewQueries.getAll(dummyUserOfficerWithRole, {
      technicalReviewId: 1,
    })
  ).resolves.toStrictEqual(dummyReviews);
});
