import { ProposalStatusActionConfig } from '../resolvers/types/ProposalStatusActionConfig';

export enum ProposalStatusActionType {
  EMAIL = 'EMAIL',
  RABBITMQ = 'RABBITMQ',
}

export class ProposalStatusAction {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: ProposalStatusActionType
  ) {}
}
export class ConnectionHasStatusAction {
  constructor(
    public connectionId: number,
    public actionId: number,
    public workflowId: number,
    public name: string,
    public type: ProposalStatusActionType,
    public config: typeof ProposalStatusActionConfig | null
  ) {}
}
