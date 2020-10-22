/* eslint-disable @typescript-eslint/camelcase */
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { logger } from '../utils/Logger';

export default function createHandler(
  proposalSettingsDatasource: ProposalSettingsDataSource
) {
  // Handler to align input for workflowEngine

  return async function proposalWorkflowHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of sending any email
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      case Event.PROPOSAL_CREATED:
      case Event.PROPOSAL_UPDATED:
        try {
          await proposalSettingsDatasource.markEventAsDoneOnProposal(
            event.type,
            event.proposal.id
          );
        } catch (error) {
          logger.logError(
            `Error while trying to mark ${event.type} event as done: `,
            error
          );
        }

        break;
    }
  };
}
