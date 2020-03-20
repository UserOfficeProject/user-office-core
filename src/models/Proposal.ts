import { ProposalStatus } from './ProposalModel';
export class Proposal {
  constructor(
    public id: number,
    public title: string,
    public abstract: string,
    public proposerId: number,
    public status: ProposalStatus,
    public created: Date,
    public updated: Date,
    public shortCode: string,
    public rankOrder: number,
    public finalStatus: number
  ) {}
}
