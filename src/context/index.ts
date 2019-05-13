import ProposalRepository from "../repositories/ProposalRepository";
import ProposalMutations from "../mutations/ProposalMutations";
import UserRepository from "../repositories/UserRepository";
import UserMutations from "../mutations/UserMutations";
import messageBroker from "../messageBroker";

export default {
  messageBroker: new messageBroker(),
  mutations: {
    proposal: new ProposalMutations(),
    user: new UserMutations()
  },
  repository: {
    proposal: new ProposalRepository(),
    user: new UserRepository()
  }
};
