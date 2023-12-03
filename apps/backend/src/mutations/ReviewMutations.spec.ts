import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyReview } from '../datasources/mockups/ReviewDataSource';
import {
  dummyFapChairWithRole,
  dummyFapSecretaryWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Review, ReviewStatus } from '../models/Review';
import ReviewMutations from './ReviewMutations';

const reviewMutations = container.resolve(ReviewMutations);

//Update

test('A reviewer can submit a review on a proposal he is on', () => {
  return expect(
    reviewMutations.updateReview(dummyUserWithRole, {
      reviewID: 10,
      comment: 'Good proposal',
      grade: 9,
      status: ReviewStatus.DRAFT,
      fapID: 1,
    })
  ).resolves.toEqual(dummyReview);
});

test('A user can not submit a review on a proposal', () => {
  return expect(
    reviewMutations.updateReview(dummyUserNotOnProposalWithRole, {
      reviewID: 1,
      comment: 'Good proposal',
      grade: 9,
      status: ReviewStatus.DRAFT,
      fapID: 1,
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not update review because of insufficient permissions'
  );
});

test('A Fap chair can not modify Fap review if it is submitted', () => {
  return expect(
    reviewMutations.updateReview(dummyFapChairWithRole, {
      reviewID: 5,
      comment: 'Good proposal test',
      grade: 9,
      status: ReviewStatus.SUBMITTED,
      fapID: 1,
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not update review because of insufficient permissions'
  );
});

test('A Fap secretary can not modify Fap review if it is submitted', () => {
  return expect(
    reviewMutations.updateReview(dummyFapSecretaryWithRole, {
      reviewID: 5,
      comment: 'Good proposal test',
      grade: 9,
      status: ReviewStatus.SUBMITTED,
      fapID: 1,
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not update review because of insufficient permissions'
  );
});

test('A userofficer can add a reviewer for a proposal', () => {
  return expect(
    reviewMutations.addUserForReview(dummyUserOfficerWithRole, {
      userID: 1,
      proposalPk: 1,
      fapID: 1,
    })
  ).resolves.toBeInstanceOf(Review);
});

test('A user can not add a reviewer for a proposal', () => {
  return expect(
    reviewMutations.addUserForReview(dummyUserWithRole, {
      userID: 1,
      proposalPk: 1,
      fapID: 1,
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A userofficer can remove a reviewer for a proposal', () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUserOfficerWithRole, {
      reviewId: 1,
      fapId: 1,
    })
  ).resolves.toBeInstanceOf(Review);
});

test('A user can not remove a reviewer for a proposal', () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUserWithRole, {
      reviewId: 1,
      fapId: 1,
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});
