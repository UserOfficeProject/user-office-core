import ProposalQueries from "./ProposalQueries";
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
const proposalQueries = new ProposalQueries(
  new proposalDataSource(),
  userAuthorization
);

test("A user on the proposal can get a proposal it belongs to", () => {
  return expect(proposalQueries.get(dummyUser, 1)).resolves.toBe(dummyProposal);
});

test("A user not on the proposal cannot get a proposal it belongs to", () => {
  return expect(
    proposalQueries.get(dummyUserNotOnProposal, dummyProposal.id)
  ).resolves.toBe(null);
});

test("A userofficer can get any proposal", () => {
  return expect(proposalQueries.get(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test("A userofficer can get all proposal", () => {
  return expect(
    proposalQueries.getAll(dummyUserOfficer)
  ).resolves.toStrictEqual({ totalCount: 1, proposals: [dummyProposal] });
});

test("A user cannot query all proposals", () => {
  return expect(proposalQueries.getAll(dummyUser)).resolves.toBe(null);
});
