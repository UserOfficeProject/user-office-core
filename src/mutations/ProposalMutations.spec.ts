import ProposalMutations from "./ProposalMutations";
import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { MessageBroker } from "../messageBroker";
import User from "../models/User";

const dummyProposal = new Proposal(1, "asd", 1);
const proposalDataSource: ProposalDataSource = {
  acceptProposal: async (id: number) => dummyProposal,
  get: async (id: number) => dummyProposal,
  create: async (abstract: string, status: number, users: number[]) =>
    dummyProposal,
  getProposals: async () => dummyProposal,
  getUserProposals: async (id: number) => dummyProposal
};

const dummyMessageBroker: MessageBroker = {
  sendMessage(message: string) {}
};

const proposalMutations = new ProposalMutations(
  proposalDataSource,
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
