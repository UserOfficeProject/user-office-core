export enum ProposalStatusActionType {
  EMAIL = 'EMAIL',
  RABBITMQ = 'RABBITMQ',
}

export class ProposalStatusAction {
  constructor(
    public id: number,
    public name: string,
    public defaultConfig: string,
    public type: ProposalStatusActionType,
    public executed: boolean,
    public config: string
  ) {}
}
