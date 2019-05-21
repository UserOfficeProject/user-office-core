import ProposalMutations from "./ProposalMutations";
import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { MessageBroker } from "../messageBroker";

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

test("Accept proposal", () => {
  expect(
    proposalMutations.accept(1, ["Beamline_Manager", "User", "User_Officer"])
  ).resolves.toBe(dummyProposal);

  expect(proposalMutations.accept(1, ["User"])).toBe(null);
});
