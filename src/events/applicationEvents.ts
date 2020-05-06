import { Proposal } from '../models/Proposal';
import { SEP } from '../models/SEP';
import { User, UserRole } from '../models/User';
import { Event } from './event.enum';

interface GeneralEvent {
  type: Event;
  key: string;
  loggedInUserId: number | null;
  isRejection: boolean;
}

interface ProposalAcceptedEvent extends GeneralEvent {
  type: Event.PROPOSAL_ACCEPTED;
  proposal: Proposal;
}

interface ProposalSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SUBMITTED;
  proposal: Proposal;
}

interface ProposalUpdatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_UPDATED;
  proposal: Proposal;
}

interface ProposalRejectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_REJECTED;
  proposal: Proposal;
  reason: string;
}

interface ProposalCreatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_CREATED;
  proposal: Proposal;
}

interface UserResetPasswordEmailEvent extends GeneralEvent {
  type: Event.USER_PASSWORD_RESET_EMAIL;
  userlinkresponse: {
    user: User;
    link: string;
  };
}

interface UserUpdateEvent extends GeneralEvent {
  type: Event.USER_UPDATED;
  user: User;
}

interface UserCreateEvent extends GeneralEvent {
  type: Event.USER_CREATED;
  userlinkresponse: {
    user: User;
    link: string;
  };
}

interface UserDeletedEvent extends GeneralEvent {
  type: Event.USER_DELETED;
  user: User;
}

interface EmailInvite extends GeneralEvent {
  type: Event.EMAIL_INVITE;
  emailinviteresponse: {
    userId: number;
    inviterId: number;
    role: UserRole;
  };
}

interface SEPCreatedEvent extends GeneralEvent {
  type: Event.SEP_CREATED;
  sep: SEP;
}

interface SEPUpdatedEvent extends GeneralEvent {
  type: Event.SEP_UPDATED;
  sep: SEP;
}

interface SEPMembersAssignedEvent extends GeneralEvent {
  type: Event.SEP_MEMBERS_ASSIGNED;
  sep: SEP;
}

interface SEPProposalAssignedEvent extends GeneralEvent {
  type: Event.SEP_PROPOSAL_ASSIGNED;
  sep: SEP;
}

interface SEPProposalRemovedEvent extends GeneralEvent {
  type: Event.SEP_PROPOSAL_REMOVED;
  sep: SEP;
}

interface SEPMemberRemovedEvent extends GeneralEvent {
  type: Event.SEP_MEMBER_REMOVED;
  sep: SEP;
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
  | UserUpdateEvent
  | SEPCreatedEvent
  | SEPUpdatedEvent
  | SEPMembersAssignedEvent
  | SEPProposalAssignedEvent
  | SEPProposalRemovedEvent
  | SEPMemberRemovedEvent
  | UserDeletedEvent;
