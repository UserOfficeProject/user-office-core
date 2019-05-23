import Proposal from "../models/Proposal";

interface ProposalAcceptedEvent {
  type: "PROPOSAL_ACCEPTED";
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
  | ProposalRejectedEvent
  | ProposalCreatedEvent;
