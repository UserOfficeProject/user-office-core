import { Proposal } from "../models/Proposal";
import { User, UserRole } from "../models/User";

interface ProposalAcceptedEvent {
  type: "PROPOSAL_ACCEPTED";
  proposal: Proposal;
}

interface ProposalSubmittedEvent {
  type: "PROPOSAL_SUBMITTED";
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

interface EmailInvite {
  type: "EMAIL_INVITE";
  userId: number;
  inviterId: number;
  role: UserRole;
}

export type ApplicationEvent =
  | ProposalAcceptedEvent
  | ProposalUpdatedEvent
  | ProposalSubmittedEvent
  | ProposalRejectedEvent
  | ProposalCreatedEvent
  | AccountCreation
  | EmailInvite
  | UserResetPasswordEmailEvent;
