import 'reflect-metadata';
import {
  ReviewDataSourceMock,
  dummyReview,
} from '../datasources/mockups/ReviewDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import {
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import { Review, ReviewStatus } from '../models/Review';
import { UserAuthorization } from '../utils/UserAuthorization';
import ReviewMutations from './ReviewMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock(),
  new SEPDataSourceMock()
);
const reviewMutations = new ReviewMutations(
  new ReviewDataSourceMock(),
  userAuthorization
);

//Update

test('A reviewer can submit a review on a proposal he is on', () => {
  return expect(
    reviewMutations.updateReview(dummyUserWithRole, {
      reviewID: 10,
      comment: 'Good proposal',
      grade: 9,
      status: ReviewStatus.DRAFT,
      sepID: 1,
    })
  ).resolves.toBe(dummyReview);
});

test('A user can not submit a review on a proposal', () => {
  return expect(
    reviewMutations.updateReview(dummyUserNotOnProposalWithRole, {
      reviewID: 1,
      comment: 'Good proposal',
      grade: 9,
      status: ReviewStatus.DRAFT,
      sepID: 1,
    })
  ).resolves.toHaveProperty('reason', 'NOT_REVIEWER_OF_PROPOSAL');
});

test('A userofficer can add a reviewer for a proposal', () => {
  return expect(
    reviewMutations.addUserForReview(dummyUserOfficerWithRole, {
      userID: 1,
      proposalID: 1,
      sepID: 1,
    })
  ).resolves.toBeInstanceOf(Review);
});

test('A user can not add a reviewer for a proposal', () => {
  return expect(
    reviewMutations.addUserForReview(dummyUserWithRole, {
      userID: 1,
      proposalID: 1,
      sepID: 1,
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A userofficer can remove a reviewer for a proposal', () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUserOfficerWithRole, {
      reviewId: 1,
      sepId: 1,
    })
  ).resolves.toBeInstanceOf(Review);
});

test('A user can not remove a reviewer for a proposal', () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUserWithRole, {
      reviewId: 1,
      sepId: 1,
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});
