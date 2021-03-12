export class ProposalStatus {
  constructor(
    public id: number,
    public shortCode: string,
    public name: string,
    public description: string,
    public isDefault: boolean
  ) {}
}
