import Proposal from "../models/Proposal";

interface ProposalAcceptedEvent {
  type: "PROPOSAL_ACCEPTED";
  proposal: Proposal;
}

interface ProposalUpdatedEvent {
  type: "PROPOSAL_UPDATED";
  proposal: Proposal;
}

interface ProposalRejectedEvent {
  type: "PROPOSAL_REJECTED";
  proposal: Proposal;
  reason: string;
}

interface ProposalCreatedEvent {
  type: "PROPOSAL_CREATED";
  proposal: Proposal;
}

export type ApplicationEvent =
  | ProposalAcceptedEvent
  | ProposalUpdatedEvent
  | ProposalRejectedEvent
  | ProposalCreatedEvent;
