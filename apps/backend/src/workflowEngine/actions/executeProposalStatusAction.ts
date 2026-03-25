import {
  ConnectionHasStatusAction,
  StatusActionType,
} from '../../models/StatusAction';
import { emailActionHandler } from '../../statusActionEngine/emailActionHandler';
import { proposalDownloadActionHandler } from '../../statusActionEngine/proposalDownloadActionHandler';
import { rabbitMQActionHandler } from '../../statusActionEngine/rabbitMQHandler';
import { WorkflowEngineProposalType } from '../proposal';

export const executeProposalStatusAction = async (
  statusAction: ConnectionHasStatusAction,
  entities: [WorkflowEngineProposalType]
) => {
  switch (statusAction.type) {
    case StatusActionType.EMAIL:
      await emailActionHandler(statusAction, entities);
      break;

    case StatusActionType.RABBITMQ:
      await rabbitMQActionHandler(statusAction, entities);
      break;

    case StatusActionType.PROPOSALDOWNLOAD:
      await proposalDownloadActionHandler(statusAction, entities);
      break;

    default:
      () => {};
  }
};
