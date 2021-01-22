import 'reflect-metadata';
import {
  ReviewDataSourceMock,
  dummyReview,
} from '../datasources/mockups/ReviewDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import {
  UserDataSourceMock,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import ReviewQueries from './ReviewQueries';

// const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock(),
  new SEPDataSourceMock()
);
const reviewQueries = new ReviewQueries(
  new ReviewDataSourceMock(),
  userAuthorization
);

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
