import "reflect-metadata";
import ReviewMutations from "./ReviewMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import {
  reviewDataSource,
  dummyReview
} from "../datasources/mockups/ReviewDataSource";
import { ApplicationEvent } from "../events/applicationEvents";

import {
  userDataSource,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";
import { Review } from "../models/Review";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const reviewMutations = new ReviewMutations(
  new reviewDataSource(),
  userAuthorization,
  dummyEventBus
);

//Update

test("A reviewer can submit a review on a proposal he is on", () => {
  return expect(
    reviewMutations.submitReview(dummyUser, {
      reviewID: 10,
      comment: "Good proposal",
      grade: 9
    })
  ).resolves.toBe(dummyReview);
});

test("A user can't submit a review on a proposal", () => {
  return expect(
    reviewMutations.submitReview(dummyUserNotOnProposal, {
      reviewID: 1,
      comment: "Good proposal",
      grade: 9
    })
  ).resolves.toHaveProperty("reason", "NOT_REVIEWER_OF_PROPOSAL");
});

test("A userofficer can add a reviewer for a proposal", () => {
  return expect(
    reviewMutations.addUserForReview(dummyUserOfficer, {
      userID: 1,
      proposalID: 1
    })
  ).resolves.toBeInstanceOf(Review);
});

test("A user can't add a reviewer for a proposal", () => {
  return expect(
    reviewMutations.addUserForReview(dummyUser, { userID: 1, proposalID: 1 })
  ).resolves.toHaveProperty("reason", "NOT_USER_OFFICER");
});

test("A userofficer can remove a reviewer for a proposal", () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUserOfficer, 1)
  ).resolves.toBeInstanceOf(Review);
});

test("A user can't remove a reviewer for a proposal", () => {
  return expect(
    reviewMutations.removeUserForReview(dummyUser, 1)
  ).resolves.toHaveProperty("reason", "NOT_USER_OFFICER");
});
