import ProposalRepository from "../repositories/ProposalRepository";
import ProposalMutations from "../mutations/ProposalMutations";
import UserRepository from "../repositories/UserRepository";

export default {
  mutations: {
    proposal: new ProposalMutations()
  },
  repository: {
    proposal: new ProposalRepository(),
    user: new UserRepository()
  }
};
