import 'reflect-metadata';
import {
  ReviewDataSourceMock,
  dummyReview,
} from '../datasources/mockups/ReviewDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import ReviewQueries from './ReviewQueries';

// const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const reviewQueries = new ReviewQueries(
  new ReviewDataSourceMock(),
  userAuthorization
);

test('A userofficer can get a review', () => {
  return expect(reviewQueries.get(dummyUserOfficer, 10)).resolves.toBe(
    dummyReview
  );
});

test('A user can not get a review', () => {
  return expect(reviewQueries.get(dummyUser, 1)).resolves.toBe(null);
});

test('A userofficer can get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyUserOfficer, 10)
  ).resolves.toStrictEqual([dummyReview]);
});

test('A user can not get reviews for a proposal', () => {
  return expect(
    reviewQueries.reviewsForProposal(dummyUser, 10)
  ).resolves.toStrictEqual(null);
});
