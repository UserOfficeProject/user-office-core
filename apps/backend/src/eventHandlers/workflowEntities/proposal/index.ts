import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { proposalStatusActionEngine } from './statusActionEngine';
import { Tokens } from '../../../config/Tokens';
import { CallDataSource } from '../../../datasources/CallDataSource';
import { ProposalDataSource } from '../../../datasources/ProposalDataSource';
import { WorkflowDataSource } from '../../../datasources/WorkflowDataSource';
import { resolveApplicationEventBus } from '../../../events';
import { Event } from '../../../events/event.enum';
import { Proposal } from '../../../models/Proposal';
import { WorkflowEngineType } from '../../../workflowEngine';
import { WorkFlowEntity } from '../../workflowHandler';

const proposalWorkflowEntity: WorkFlowEntity = {
  name: 'Proposal',
  extractionEntityKeys: ['primaryKey', 'proposalPk', 'proposalPks'],
  exemptedEvents: [Event.PROPOSAL_DELETED],
  resolveWorkflowId: async (entityId: number) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const callDataSource = container.resolve<CallDataSource>(
      Tokens.CallDataSource
    );

    const proposal = await proposalDataSource.get(entityId);

    if (!proposal) {
      logger.logError('Proposal not found', { entityId });

      return;
    }

    const workflowId = (
      await callDataSource.getProposalWorkflowByCall(proposal.callId)
    )?.id;

    return workflowId;
  },
  resolveCurrentStatusId: async (entityId: number) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const proposal = await proposalDataSource.get(entityId);

    return proposal?.workflowStatusId;
  },
  updateWorkflowStatus: async (
    entityId: number,
    newWorkflowStatusId: number
  ) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    await proposalDataSource.changeProposalsWorkflowStatus(
      newWorkflowStatusId,
      [entityId]
    );
  },
  onWorkflowStatusChange: async (entities: WorkflowEngineType[]) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const workflowDataSource = container.resolve<WorkflowDataSource>(
      Tokens.WorkflowDataSource
    );
    const eventBus = resolveApplicationEventBus();

    const allProposals = await Promise.all(
      entities.map(async (entity) => {
        const {
          entityId,
          prevStatusId,
          nextStatusId,
          workflowStatusConnectionId,
        } = entity;

        const proposal = await proposalDataSource.get(entityId);

        if (!proposal) {
          logger.logError('Proposal not found for workflow status change', {
            entityId,
          });

          return null;
        }

        const previousWorkflowStatus =
          await workflowDataSource.getWorkflowStatus(prevStatusId);
        const nextWorkflowStatus =
          await workflowDataSource.getWorkflowStatus(nextStatusId);

        await eventBus.publish({
          type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
          proposal,
          isRejection: false,
          key: 'proposal',
          loggedInUserId: null,
          description: `From "${previousWorkflowStatus?.statusId}" to "${nextWorkflowStatus?.statusId}"`,
        });

        return { proposal, workflowStatusConnectionId };
      })
    );
    const validProposals = allProposals.filter(
      (
        item
      ): item is { proposal: Proposal; workflowStatusConnectionId: number } =>
        item !== null
    );
    await proposalStatusActionEngine(validProposals);
  },
};

export default proposalWorkflowEntity;
