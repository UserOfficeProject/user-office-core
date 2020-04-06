import 'reflect-metadata';
import {
  ReviewDataSourceMock,
  dummyReview,
} from '../datasources/mockups/ReviewDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { Review, ReviewStatus } from '../models/Review';
import { UserAuthorization } from '../utils/UserAuthorization';
import ReviewMutations from './ReviewMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const reviewMutations = new ReviewMutations(
  new ReviewDataSourceMock(),
  userAuthorization
);

//Update

test('A reviewer can submit a review on a proposal he is on', () => {
  return expect(
    reviewMutations.updateReview(dummyUser, {
      reviewID: 10,
      comment: 'Good proposal',
      grade: 9,
      status: ReviewStatus.DRAFT,
    })
  ).resolves.toBe(dummyReview);
});

test('A user can not submit a review on a proposal', () => {
  return expect(
    reviewMutations.updateReview(dummyUserNotOnProposal, {
      reviewID: 1,
      comment: 'Good proposal',
      grade: 9,
      status: ReviewStatus.DRAFT,
    })
  ).resolves.toHaveProperty('reason', 'NOT_REVIEWER_OF_PROPOSAL');
});

test('A userofficer can add a reviewer for a proposal', () => {
  return expect(
    reviewMutations.addUserForReview(dummyUserOfficer, {
      userID: 1,
      proposalID: 1,
    })
  ).resolves.toBeInstanceOf(Review);
});

test('A user can not add a reviewer for a proposal', () => {
  return expect(
    reviewMutations.addUserForReview(dummyUser, { userID: 1, proposalID: 1 })
  ).resolves.toHaveProperty('reason', 'NOT_USER_OFFICER');
});

test('A userofficer can remove a reviewer for a proposal', () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUserOfficer, 1)
  ).resolves.toBeInstanceOf(Review);
});

test('A user can not remove a reviewer for a proposal', () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUser, 1)
  ).resolves.toHaveProperty('reason', 'NOT_USER_OFFICER');
});
