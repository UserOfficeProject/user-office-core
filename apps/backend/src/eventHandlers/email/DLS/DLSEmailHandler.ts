import { logger } from '@user-office-software/duo-logger';

import { proposalCoProposerInvitesUpdatedHandler } from './proposalCoProposerInvitesUpdatedHandler';
import { proposalSubmittedHandler } from './proposalSubmittedHandler';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { Event } from '../../../events/event.enum';

export async function DSLEmailHandler(event: ApplicationEvent) {
  const handlers: Partial<
    Record<Event, (event: ApplicationEvent) => Promise<void>>
  > = {
    [Event.PROPOSAL_SUBMITTED]: proposalSubmittedHandler,
    [Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED]:
      proposalCoProposerInvitesUpdatedHandler,
  };

  if (event.isRejection) return;

  const handler = handlers[event.type];

  if (!handler) {
    logger.logError('No handler for event type', { type: event.type });

    return;
  }

  return await handler(event);
}
