import { Call } from '../models/Call';
import { CallHasInstrument } from '../models/Instrument';
import { Proposal, ProposalIds } from '../models/Proposal';
import { Review } from '../models/Review';
import { Sample } from '../models/Sample';
import { SEP } from '../models/SEP';
import { TechnicalReview } from '../models/TechnicalReview';
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

interface ProposalFeasibleEvent extends GeneralEvent {
  type: Event.PROPOSAL_FEASIBLE;
  proposal: Proposal;
}

interface ProposalSampleSafeEvent extends GeneralEvent {
  type: Event.PROPOSAL_SAMPLE_SAFE;
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

interface ProposalNotifiedEvent extends GeneralEvent {
  type: Event.PROPOSAL_NOTIFIED;
  proposal: Proposal;
}

interface ProposalFeasibilityReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED;
  technicalreview: TechnicalReview;
}

interface ProposalSEPReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_REVIEW_SUBMITTED;
  review: Review;
}

interface ProposalSampleReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED;
  sample: Sample;
}

interface ProposalInstrumentSelectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_INSTRUMENT_SELECTED;
  proposalids: ProposalIds;
}

interface ProposalSEPSelectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_SELECTED;
  proposalids: ProposalIds;
}

interface ProposalInstrumentSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_INSTRUMENT_SUBMITTED;
  callhasinstrument: CallHasInstrument;
}

interface ProposalSEPMeetingSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_MEETING_SUBMITTED;
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

interface UserRoleUpdateEvent extends GeneralEvent {
  type: Event.USER_ROLE_UPDATED;
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

interface SEPMemberAssignedToProposalEvent extends GeneralEvent {
  type: Event.SEP_MEMBER_ASSIGNED_TO_PROPOSAL;
  sep: SEP;
}

interface SEPMemberRemovedFromProposalEvent extends GeneralEvent {
  type: Event.SEP_MEMBER_REMOVED_FROM_PROPOSAL;
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

interface CallEndedEvent extends GeneralEvent {
  type: Event.CALL_ENDED;
  call: Call;
}

interface CallReviewEndedEvent extends GeneralEvent {
  type: Event.CALL_REVIEW_ENDED;
  call: Call;
}

interface CallSEPReviewEndedEvent extends GeneralEvent {
  type: Event.CALL_SEP_REVIEW_ENDED;
  call: Call;
}

export type ApplicationEvent =
  | ProposalAcceptedEvent
  | ProposalUpdatedEvent
  | ProposalSubmittedEvent
  | ProposalFeasibleEvent
  | ProposalSampleSafeEvent
  | ProposalRejectedEvent
  | ProposalCreatedEvent
  | UserCreateEvent
  | EmailInvite
  | UserResetPasswordEmailEvent
  | UserUpdateEvent
  | UserRoleUpdateEvent
  | SEPCreatedEvent
  | SEPUpdatedEvent
  | SEPMembersAssignedEvent
  | SEPProposalAssignedEvent
  | SEPProposalRemovedEvent
  | SEPMemberRemovedEvent
  | SEPMemberAssignedToProposalEvent
  | SEPMemberRemovedFromProposalEvent
  | UserDeletedEvent
  | ProposalNotifiedEvent
  | CallEndedEvent
  | CallReviewEndedEvent
  | CallSEPReviewEndedEvent
  | ProposalFeasibilityReviewSubmittedEvent
  | ProposalSEPReviewSubmittedEvent
  | ProposalSampleReviewSubmittedEvent
  | ProposalInstrumentSelectedEvent
  | ProposalSEPSelectedEvent
  | ProposalInstrumentSubmittedEvent
  | ProposalSEPMeetingSubmittedEvent;
