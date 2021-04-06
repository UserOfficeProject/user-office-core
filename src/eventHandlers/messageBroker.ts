import { Queue, RabbitMQMessageBroker } from '@esss-swap/duo-message-broker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventHandler } from '../events/eventBus';
import { ProposalEndStatus } from '../models/Proposal';

export function createPostToQueueHandler() {
  // return the mapped implementation
  return container.resolve<EventHandler<ApplicationEvent>>(
    Tokens.PostToMessageQueue
  );
}

export function createPostToRabbitMQHandler() {
  const reviewDataSource = container.resolve<ReviewDataSource>(
    Tokens.ReviewDataSource
  );
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );

  const rabbitMQ = new RabbitMQMessageBroker();

  rabbitMQ.setup({
    hostname: process.env.RABBITMQ_HOSTNAME,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
  });

  return async (event: ApplicationEvent) => {
    // if the original method failed
    // there is no point of publishing any event
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      // TODO: maybe put it behind a feature flag, may only be relevant for ESS
      case Event.PROPOSAL_NOTIFIED: {
        const { proposal } = event;

        if (
          // we only care about accepted and reserved proposals
          ![ProposalEndStatus.ACCEPTED, ProposalEndStatus.RESERVED].includes(
            proposal.finalStatus
          )
        ) {
          return;
        }

        const [review, instrument] = await Promise.all([
          reviewDataSource.getTechnicalReview(proposal.id),
          instrumentDataSource.getInstrumentByProposalId(proposal.id),
        ]);

        if (!review || !instrument) {
          // TODO: maybe log centrally, probably shouldn't happen
          console.warn(
            `Proposal '${proposal.id}' has no review and/or instrument`,
            { review, instrument }
          );

          return;
        }

        // NOTE: maybe use shared types?
        const message = {
          proposalId: proposal.id,
          callId: proposal.callId,
          // the UI supports days only currently
          allocatedTime: review.timeAllocation * 24 * 60 * 60,
          instrumentId: instrument.id,
        };

        const json = JSON.stringify(message);

        await rabbitMQ.sendMessage(Queue.PROPOSAL, event.type, json);
      }
    }
  };
}

export function createSkipPostingHandler() {
  return async (event: ApplicationEvent) => {
    // no op
  };
}
