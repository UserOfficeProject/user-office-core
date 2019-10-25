import { ProposalStatus } from "./ProposalModel";
export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposer: number,
    public status: ProposalStatus,
    public created: string,
    public updated: string,
    public shortCode: string
  ) {}
}
