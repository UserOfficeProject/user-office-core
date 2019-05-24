import ProposalMutations from "./ProposalMutations";

import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../datasources/ProposalDataSource";
import User from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import {
  proposalDataSource,
  dummyProposal
} from "../datasources/mockups/ProposalDataSource";

const dummyEventBus = new EventBus<ApplicationEvent>();

const proposalMutations = new ProposalMutations(
  new proposalDataSource(),
  dummyEventBus
);

test("A user officer can accept a proposal ", () => {
  const agent = new User(0, "", "", ["User_Officer"]);
  expect(proposalMutations.accept(agent, 1)).resolves.toBe(dummyProposal);
});

test("A non-officer user cannot accept a proposal", () => {
  const agent = new User(0, "", "", []);
  expect(proposalMutations.accept(agent, 1)).resolves.toHaveProperty(
    "reason",
    "NOT_USER_OFFICER"
  );
});

test("A non-logged in user cannot accept a proposal", () => {
  const agent = null;
  const result = proposalMutations.accept(agent, 1);
  expect(result).resolves.toHaveProperty("reason", "NOT_LOGGED_IN");
});
