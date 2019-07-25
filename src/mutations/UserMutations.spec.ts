import UserMutations from "./UserMutations";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";

import { ApplicationEvent } from "../events/applicationEvents";
import {
  proposalDataSource,
  dummyProposalSubmitted,
  dummyProposal
} from "../datasources/mockups/ProposalDataSource";

import {
  userDataSource,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource()
);
const userMutations = new UserMutations(
  new userDataSource(),
  userAuthorization
);

test("A user can update it's own name", () => {
  return expect(
    userMutations.update(dummyUser, "2", "klara", undefined, undefined)
  ).resolves.toBe(dummyUser);
});

test("A user cannot update another users name", () => {
  return expect(
    userMutations.update(
      dummyUserNotOnProposal,
      "2",
      "klara",
      undefined,
      undefined
    )
  ).resolves.toHaveProperty("reason", "WRONG_PERMISSIONS");
});

test("A not logged in user cannot update another users name", () => {
  return expect(
    userMutations.update(null, "2", "klara", undefined, undefined)
  ).resolves.toHaveProperty("reason", "WRONG_PERMISSIONS");
});

test("A userofficer can update another users name", () => {
  return expect(
    userMutations.update(dummyUserOfficer, "2", "klara", undefined, undefined)
  ).resolves.toBe(dummyUser);
});

test("A user cannot update it's roles", () => {
  return expect(
    userMutations.update(dummyUser, "2", undefined, undefined, [1, 2])
  ).resolves.toHaveProperty("reason", "WRONG_PERMISSIONS");
});

test("A userofficer can update users roles", () => {
  return expect(
    userMutations.update(dummyUserOfficer, "2", undefined, undefined, [1, 2])
  ).resolves.toBe(dummyUser);
});
