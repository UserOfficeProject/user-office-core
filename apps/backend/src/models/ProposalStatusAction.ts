import { ProposalStatusActionConfig } from '../resolvers/types/ProposalStatusActionConfig';

export enum ProposalStatusActionType {
  EMAIL = 'EMAIL',
  RABBITMQ = 'RABBITMQ',
}

export class ProposalStatusAction {
  constructor(
    public id: number,
    public connectionId: number,
    public name: string,
    public type: ProposalStatusActionType,
    public executed: boolean,
    public config: typeof ProposalStatusActionConfig
  ) {}
}
