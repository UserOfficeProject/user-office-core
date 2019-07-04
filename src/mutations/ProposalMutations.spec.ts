import ProposalMutations from "./ProposalMutations";
import { EventBus } from "../events/eventBus";
import UserAuthorization from "../utils/UserAuthorization";

import { ApplicationEvent } from "../events/applicationEvents";
import {
  proposalDataSource,
  dummyProposal
} from "../datasources/mockups/ProposalDataSource";

import {
  userDataSource,
  dummyUser,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource()
);
const proposalMutations = new ProposalMutations(
  new proposalDataSource(),
  userAuthorization,
  dummyEventBus
);

test("A user officer can accept a proposal ", () => {
  expect(proposalMutations.accept(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test("A non-officer user cannot accept a proposal", () => {
  expect(proposalMutations.accept(dummyUser, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_USER_OFFICER"
  );
});

test("A non-logged in user cannot accept a proposal", () => {
  const agent = null;
  const result = proposalMutations.accept(agent, 1);
  expect(result).resolves.toHaveProperty("reason", "NOT_LOGGED_IN");
});

test("A user officer can not accept a proposal that does not exist", () => {
  expect(
    proposalMutations.accept(dummyUserOfficer, -1)
  ).resolves.toHaveProperty("reason", "INTERNAL_ERROR");
});
