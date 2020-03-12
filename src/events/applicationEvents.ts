import { Event } from "./event.enum";
import { Proposal } from "../models/Proposal";
import { User, UserRole } from "../models/User";

interface ProposalAcceptedEvent {
  type: Event.PROPOSAL_ACCEPTED;
  proposal: Proposal;
  loggedInUserId: number | null;
}

interface ProposalSubmittedEvent {
  type: Event.PROPOSAL_SUBMITTED;
  proposal: Proposal;
  loggedInUserId: number | null;
}

interface ProposalUpdatedEvent {
  type: Event.PROPOSAL_UPDATED;
  proposal: Proposal;
  loggedInUserId: number | null;
}

interface ProposalRejectedEvent {
  type: Event.PROPOSAL_REJECTED;
  proposal: Proposal;
  reason: string;
  loggedInUserId: number | null;
}

interface ProposalCreatedEvent {
  type: Event.PROPOSAL_CREATED;
  proposal: Proposal;
  loggedInUserId: number | null;
}

interface UserResetPasswordEmailEvent {
  type: Event.USER_PASSWORD_RESET_EMAIL;
  user: User;
  link: string;
  loggedInUserId: number | null;
}

interface UserUpdateEvent {
  type: Event.USER_UPDATED;
  user: User;
  loggedInUserId: number | null;
}

interface UserCreateEvent {
  type: Event.USER_CREATED;
  user: User;
  link: string;
  loggedInUserId: number | null;
}

interface EmailInvite {
  type: Event.EMAIL_INVITE;
  userId: number;
  inviterId: number;
  role: UserRole;
  loggedInUserId: number | null;
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
