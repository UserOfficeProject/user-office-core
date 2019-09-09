import { Proposal } from "../models/Proposal";
import { User } from "../models/user";

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

interface UserResetPasswordEmailEvent {
  type: "PASSWORD_RESET_EMAIL";
  user: User;
  link: string;
}

interface AccountCreation {
  type: "ACCOUNT_CREATED";
  user: User;
  link: string;
}

export type ApplicationEvent =
  | ProposalAcceptedEvent
  | ProposalUpdatedEvent
  | ProposalRejectedEvent
  | ProposalCreatedEvent
  | AccountCreation
  | UserResetPasswordEmailEvent;
