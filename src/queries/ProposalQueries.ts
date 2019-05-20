import { ProposalDataSource } from "../repositories/ProposalInterface";

export default class Queries {
  get(id: number, proposalDataSource: ProposalDataSource) {
    return proposalDataSource.get(id);
  }
}
