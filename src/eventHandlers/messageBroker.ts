import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Queue, RabbitMQMessageBroker } from '../messageBroker';
import { ProposalEndStatus } from '../models/Proposal';

export default function createHandler({
  reviewDataSource,
  instrumentDataSource,
}: {
  reviewDataSource: ReviewDataSource;
  instrumentDataSource: InstrumentDataSource;
}) {
  const rabbitMQ = new RabbitMQMessageBroker();

  return async function messageBrokerHandler(event: ApplicationEvent) {
    // if the original method failed
    // there is no point of publishing any event
    if (event.isRejection) {
      return;
    }

    switch (event.type) {
      // case Event.PROPOSAL_ACCEPTED: {
      //   const { proposal } = event;
      //   const message = [proposal.id, proposal.statusId];a
      //   const json = JSON.stringify(message);
      //   rabbitMQ.sendMessage(json);
      // }
      // case Event.PROPOSAL_CREATED: {
      //   const { proposal } = event;
      //   const message = [proposal.id, proposal.statusId];
      //   const json = JSON.stringify(message);
      //   rabbitMQ.sendMessage(json);
      // }

      // TODO: maybe put it behind a feature flag, may only be relevant for ESS
      case Event.PROPOSAL_NOTIFIED: {
        const { proposal } = event;

        if (
          // we only care about accepted proposals
          proposal.finalStatus !== ProposalEndStatus.ACCEPTED
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
