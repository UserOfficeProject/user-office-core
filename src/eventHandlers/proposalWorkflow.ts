/* eslint-disable @typescript-eslint/camelcase */
import { proposalDataSource } from '../datasources';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { logger } from '../utils/Logger';

export default function createHandler(proposalDatasource: ProposalDataSource) {
  // Handler to align input for workflowEngine

  return async function proposalWorkflowHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of sending any email
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      case Event.PROPOSAL_CREATED:
      case Event.PROPOSAL_SUBMITTED:
      case Event.PROPOSAL_NOTIFIED:
      case Event.PROPOSAL_ACCEPTED:
      case Event.PROPOSAL_REJECTED:
      case Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED:
      case Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED:
      case Event.PROPOSAL_INSTRUMENT_SELECTED:
      case Event.PROPOSAL_SEP_SELECTED:
      case Event.PROPOSAL_INSTRUMENT_SUBMITTED:
      case Event.PROPOSAL_SEP_MEETING_SUBMITTED:
        try {
          await proposalDatasource.markEventAsDoneOnProposal(
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

      case Event.CALL_ENDED:
        try {
          const allProposalsOnCall = await proposalDataSource.getProposalsFromView(
            { callId: event.call.id }
          );

          if (allProposalsOnCall && allProposalsOnCall.length) {
            // TODO: Call worklowEngine here for each proposal and then update events.
            await Promise.all(
              allProposalsOnCall.map(
                async proposalOnCall =>
                  await proposalDataSource.markEventAsDoneOnProposal(
                    event.type,
                    proposalOnCall.id
                  )
              )
            );
          }
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
