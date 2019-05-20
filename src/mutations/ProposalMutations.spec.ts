import ProposalMutations from "./ProposalMutations";
import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../repositories/ProposalInterface";

const proposalMutations = new ProposalMutations();

test("Accept proposal", () => {
  const dummyProposal = new Proposal(1, "asd", 1);
  const proposalDataSource: ProposalDataSource = {
    acceptProposal: async (id: number) => dummyProposal,
    get: async (id: number) => dummyProposal,
    create: async (abstract: string, status: number, users: Array<number>) =>
      dummyProposal,
    getProposals: async () => dummyProposal,
    getUserProposals: async (id: number) => dummyProposal
  };
  expect(proposalMutations.accept(1, proposalDataSource)).resolves.toBe(
    dummyProposal
  );
});
