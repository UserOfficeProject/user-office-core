import { ProposalStatusActionConfig } from '../resolvers/types/ProposalStatusActionConfig';

export enum StatusActionType {
  EMAIL = 'EMAIL',
  RABBITMQ = 'RABBITMQ',
}

export class StatusAction {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: StatusActionType
  ) {}
}
export class ConnectionHasStatusAction {
  constructor(
    public connectionId: number,
    public actionId: number,
    public workflowId: number,
    public name: string,
    public type: StatusActionType,
    public config: typeof ProposalStatusActionConfig | null //TODO: This needs to be made generic
  ) {}
}
