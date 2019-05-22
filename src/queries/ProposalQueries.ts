import { ProposalDataSource } from "../datasources/ProposalDataSource";

export default class ProposalQueries {
  constructor(private dataSource: ProposalDataSource) {}

  public get(id: number) {
    return this.dataSource.get(id);
  }

  public getAll() {
    return this.dataSource.getProposals();
  }
}
