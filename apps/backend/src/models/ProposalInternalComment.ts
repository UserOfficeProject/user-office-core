export class ProposalInternalComment {
  constructor(
    public commentId: number,
    public proposalPk: number,
    public comment: string
  ) {}
}
