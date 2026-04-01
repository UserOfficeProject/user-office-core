import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { WorkflowDataSource } from '../../datasources/WorkflowDataSource';
import { resolveApplicationEventBus } from '../../events';
import { Event } from '../../events/event.enum';
import { WorkFlowEntity } from '../workflowHandler';

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

    // For now, we are assuming that there is only one workflow for proposal. In future, if there are multiple workflows for proposal, we can use the event type to determine the workflow id.
    const proposal = await proposalDataSource.get(entityId);

    if (!proposal) {
      logger.logError('Proposal not found', { entityId });

      return;
    }

    const workflowId = (
      await callDataSource.getProposalWorkflowByCall(proposal.callId)
    )?.id;

    if (!workflowId) {
      logger.logError('Workflow not found for proposal', { entityId });

      return;
    }

    return workflowId;
  },
  resolveCurrentStatusId: async (entityId: number) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const proposal = await proposalDataSource.get(entityId);

    if (!proposal) {
      logger.logError('Proposal not found', { entityId });

      return;
    }

    if (!proposal.workflowStatusId) {
      logger.logError('Workflow status id not found for proposal', {
        entityId,
      });

      return;
    }

    return proposal.workflowStatusId;
  },
  updateWorkflowStatus: async (entityId: number, workflowStatusId: number) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    await proposalDataSource.updateProposalWfStatus(entityId, workflowStatusId);
  },
  onWorkflowStatusChange: async (
    entityId: number,
    prevStatusId: number,
    nextStatusId: number
  ) => {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );
    const workflowDataSource = container.resolve<WorkflowDataSource>(
      Tokens.WorkflowDataSource
    );
    const eventBus = resolveApplicationEventBus();

    const proposal = await proposalDataSource.get(entityId);

    if (!proposal) {
      logger.logError('Proposal not found for workflow status change', {
        entityId,
      });

      return;
    }

    const previousWorkflowStatus =
      await workflowDataSource.getWorkflowStatus(prevStatusId);
    const nextWorkflowStatus =
      await workflowDataSource.getWorkflowStatus(nextStatusId);

    return eventBus.publish({
      type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
      proposal,
      isRejection: false,
      key: 'proposal',
      loggedInUserId: null,
      description: `From "${previousWorkflowStatus?.statusId}" to "${nextWorkflowStatus?.statusId}"`,
    });
  },
};

export default proposalWorkflowEntity;
