import 'reflect-metadata';
import { container } from 'tsyringe';

import ReviewQueries from './ReviewQueries';
import { dummyReview } from '../datasources/mockups/ReviewDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyProposalReaderWithFapAccess,
  dummyProposalReaderWithoutFapAccess,
} from '../datasources/mockups/UserDataSource';

const reviewQueries = container.resolve(ReviewQueries);

test('A userofficer can get a review', () => {
  return expect(
    reviewQueries.get(dummyUserOfficerWithRole, { reviewId: 10 })
  ).resolves.toBe(dummyReview);
});

test('A user can not get a review', () => {
  return expect(
    reviewQueries.get(dummyUserNotOnProposalWithRole, { reviewId: 1 })
  ).resolves.toBe(null);
});

test('A userofficer can get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyUserOfficerWithRole, {
      proposalPk: 10,
    })
  ).resolves.toStrictEqual([dummyReview]);
});

test('A user can not get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyUserNotOnProposalWithRole, {
      proposalPk: 10,
    })
  ).resolves.toStrictEqual(null);
});

test('A proposal reader with FAP access can get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyProposalReaderWithFapAccess, {
      proposalPk: 10,
    })
  ).resolves.toStrictEqual([dummyReview]);
});

test('A proposal reader without FAP access cannot get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyProposalReaderWithoutFapAccess, {
      proposalPk: 10,
    })
  ).resolves.toStrictEqual([]);
});
