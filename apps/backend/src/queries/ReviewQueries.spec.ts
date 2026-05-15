import 'reflect-metadata';
import { container } from 'tsyringe';

import ReviewQueries from './ReviewQueries';
import { dummyReview } from '../datasources/mockups/ReviewDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyProposalReaderWithTechnicalReviewAccess,
  dummyProposalReaderWithoutTechnicalReviewAccess,
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

test('A proposal reader with hasTechnicalReviewAccess can get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(
      dummyProposalReaderWithTechnicalReviewAccess,
      { proposalPk: 10 }
    )
  ).resolves.toStrictEqual([dummyReview]);
});

test('A proposal reader without hasTechnicalReviewAccess cannot get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(
      dummyProposalReaderWithoutTechnicalReviewAccess,
      { proposalPk: 10 }
    )
  ).resolves.toBe(null);
});
