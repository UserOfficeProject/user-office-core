import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyReview } from '../datasources/mockups/ReviewDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import ReviewQueries from './ReviewQueries';

const reviewQueries = container.resolve(ReviewQueries);

test('A userofficer can get a review', () => {
  return expect(
    reviewQueries.get(dummyUserOfficerWithRole, { reviewId: 10 })
  ).resolves.toBe(dummyReview);
});

test('A user can not get a review', () => {
  return expect(
    reviewQueries.get(dummyUserWithRole, { reviewId: 1 })
  ).resolves.toBe(null);
});

test('A userofficer can get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyUserOfficerWithRole, 10)
  ).resolves.toStrictEqual([dummyReview]);
});

test('A user can not get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyUserWithRole, 10)
  ).resolves.toStrictEqual(null);
});
