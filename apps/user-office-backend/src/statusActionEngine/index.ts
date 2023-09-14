import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { ProposalStatusActionType } from '../models/ProposalStatusAction';
import {
  WorkflowEngineProposalType,
  getProposalWorkflowConnectionByStatusId,
} from '../workflowEngine';
import { emailActionHandler } from './emailActionHandler';
import { rabbitMQActionHandler } from './rabbitMQHandler';
import { groupProposalsByProperties } from './statusActionUtils';

export const statusActionEngine = async (
  proposals: WorkflowEngineProposalType[]
) => {
  const proposalSettingsDataSource: ProposalSettingsDataSource =
    container.resolve(Tokens.ProposalSettingsDataSource);

  // NOTE: We need to group the proposals by 'workflow' and 'status' because proposals coming in here can be from different workflows/calls.
  const groupByProperties = ['workflowId', 'statusId'];
  // NOTE: Here the result is something like: [[proposalsWithWorkflowStatusIdCombination1], [proposalsWithWorkflowStatusIdCombination2]...]
  const groupResult = groupProposalsByProperties(proposals, groupByProperties);

  Promise.all(
    groupResult.map(async (groupedProposals) => {
      // NOTE: We get the needed ids from the first proposal in the group.
      const [{ workflowId, statusId, prevProposalStatusId }] = groupedProposals;

      const [currentConnection] = await getProposalWorkflowConnectionByStatusId(
        workflowId,
        statusId,
        prevProposalStatusId
      );

      const proposalStatusActions =
        await proposalSettingsDataSource.getStatusActionsByConnectionId(
          currentConnection.id,
          currentConnection.proposalWorkflowId
        );

      if (!proposalStatusActions?.length) {
        return;
      }

      Promise.all(
        proposalStatusActions.map(async (proposalStatusAction) => {
          if (
            !proposalStatusAction.id ||
            !proposalStatusAction.type ||
            proposalStatusAction.executed
          ) {
            return;
          }

          switch (proposalStatusAction.type) {
            case ProposalStatusActionType.EMAIL:
              emailActionHandler(proposalStatusAction, groupedProposals);
              break;

            case ProposalStatusActionType.RABBITMQ:
              rabbitMQActionHandler(proposalStatusAction, groupedProposals);
              break;

            default:
              break;
          }
        })
      );
    })
  );
};
