import { Proposal } from '../models/Proposal';
import { User } from '../models/User';

interface ProposalAcceptedEvent {
  type: 'PROPOSAL_ACCEPTED';
  proposal: Proposal;
  loggedInUserId: number;
}

interface ProposalSubmittedEvent {
  type: 'PROPOSAL_SUBMITTED';
  proposal: Proposal;
  loggedInUserId: number;
}

interface ProposalUpdatedEvent {
  type: 'PROPOSAL_UPDATED';
  proposal: Proposal;
  loggedInUserId: number;
}

interface ProposalRejectedEvent {
  type: 'PROPOSAL_REJECTED';
  proposal: Proposal;
  reason: string;
  loggedInUserId: number;
}

interface ProposalCreatedEvent {
  type: 'PROPOSAL_CREATED';
  proposal: Proposal;
  loggedInUserId: number;
}

interface UserResetPasswordEmailEvent {
  type: 'PASSWORD_RESET_EMAIL';
  user: User;
  link: string;
  loggedInUserId: number;
}

interface UserUpdateEvent {
  type: 'USER_UPDATED';
  user: User;
  loggedInUserId: number;
}

interface UserCreateEvent {
  type: 'USER_CREATED';
  user: User;
  link: string;
  loggedInUserId: number;
}

interface EmailInvite {
  type: 'EMAIL_INVITE';
  userId: number;
  inviterId: number;
  loggedInUserId: number;
}

export type ApplicationEvent =
  | ProposalAcceptedEvent
  | ProposalUpdatedEvent
  | ProposalSubmittedEvent
  | ProposalRejectedEvent
  | ProposalCreatedEvent
  | UserCreateEvent
  | EmailInvite
  | UserResetPasswordEmailEvent
  | UserUpdateEvent;
