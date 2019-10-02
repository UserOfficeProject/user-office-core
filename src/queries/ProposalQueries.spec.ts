import ProposalQueries from "./ProposalQueries";
import { UserAuthorization } from "../utils/UserAuthorization";

import {
  proposalDataSource,
  dummyProposal,
  dummyAnswers
} from "../datasources/mockups/ProposalDataSource";

import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";

import {
  userDataSource,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";
import { ProposalTemplate } from "../models/Proposal";
import { DummyLogger } from "../utils/Logger";

const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource(),
  new reviewDataSource()
);
const proposalQueries = new ProposalQueries(
  new proposalDataSource(),
  userAuthorization,
  new DummyLogger()
);

test("A user on the proposal can get a proposal it belongs to", () => {
  return expect(proposalQueries.get(dummyUser, 1)).resolves.toBe(dummyProposal);
});

test("A user not on the proposal cannot get a proposal", () => {
  return expect(
    proposalQueries.get(dummyUserNotOnProposal, dummyProposal.id)
  ).resolves.toBe(null);
});

test("A userofficer can get any proposal", () => {
  return expect(proposalQueries.get(dummyUserOfficer, 1)).resolves.toBe(
    dummyProposal
  );
});

test("Get questionary should succeed for authorized user", () => {
  return expect(proposalQueries.getQuestionary(dummyUser, 1)).resolves.not.toBe(null)
});

test("Get questionary should not succeed for unauthorized user", () => {
  return expect(proposalQueries.getQuestionary(dummyUserNotOnProposal, 1)).resolves.toBe(null);
});

test("A userofficer can get all proposal", () => {
  return expect(
    proposalQueries.getAll(dummyUserOfficer)
  ).resolves.toStrictEqual({ totalCount: 1, proposals: [dummyProposal] });
});

test("A user cannot query all proposals", () => {
  return expect(proposalQueries.getAll(dummyUser)).resolves.toBe(null);
});

test("Non authentificated user can not get the template", () => {
  return expect(proposalQueries.getProposalTemplate(null)).resolves.not.toBeInstanceOf(ProposalTemplate);
});

test("User officer user can get the template", () => {
  return expect(proposalQueries.getProposalTemplate(dummyUserOfficer)).resolves.toBeInstanceOf(ProposalTemplate);
});

test("Proposal template should have fields", async () => {
  let template = await proposalQueries.getProposalTemplate(dummyUserOfficer) as ProposalTemplate;
  return expect(template.topics[0].fields!.length).toBeGreaterThan(0);
});