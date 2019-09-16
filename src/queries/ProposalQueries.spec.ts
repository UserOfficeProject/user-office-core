import ProposalQueries from "./ProposalQueries";
import { EventBus } from "../events/eventBus";
import { UserAuthorization } from "../utils/UserAuthorization";
import { Rejection, rejection } from "../rejection";

import { ApplicationEvent } from "../events/applicationEvents";
import {
  proposalDataSource,
  dummyProposalSubmitted,
  dummyProposal
} from "../datasources/mockups/ProposalDataSource";

import { reviewDataSource } from "../datasources/mockups/ReviewDataSource";

import {
  userDataSource,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer
} from "../datasources/mockups/UserDataSource";
import { ProposalTemplate } from "../models/Proposal";

const dummyEventBus = new EventBus<ApplicationEvent>();
const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new proposalDataSource(),
  new reviewDataSource()
);
const proposalQueries = new ProposalQueries(
  new proposalDataSource(),
  userAuthorization
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

test("Authentificated user can get the template", () => {
  return expect(proposalQueries.getProposalTemplate(dummyUser)).resolves.toBeInstanceOf(ProposalTemplate);
});

test("Proposal template should have fields", async () => {
  let template = await proposalQueries.getProposalTemplate(dummyUser) as ProposalTemplate;
  return expect(template.topics[0].fields!.length).toBeGreaterThan(0);
});