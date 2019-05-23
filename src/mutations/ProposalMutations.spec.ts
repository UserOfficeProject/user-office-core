import ProposalMutations from "./ProposalMutations";
import Proposal from "../models/Proposal";
import { MessageBroker } from "../messageBroker";
import User from "../models/User";
import {
  proposalDataSource,
  dummyProposal
} from "../datasources/mockups/ProposalDataSource";

const dummyMessageBroker: MessageBroker = {
  sendMessage(message: string) {}
};
const proposalMutations = new ProposalMutations(
  new proposalDataSource(),
  dummyMessageBroker
);

test("A user officer can accept a proposal ", () => {
  const agent = new User(0, "", "", ["User_Officer"]);
  expect(proposalMutations.accept(agent, 1)).resolves.toBe(dummyProposal);
});

test("A non-officer user cannot accept a proposal", () => {
  const agent = new User(0, "", "", []);
  expect(proposalMutations.accept(agent, 1)).resolves.toBe(null);
});
