import { Call } from '../models/Call';
import { Instrument, InstrumentHasProposals } from '../models/Instrument';
import { Proposal, ProposalPks, Proposals } from '../models/Proposal';
import { QuestionaryStep } from '../models/Questionary';
import { Review } from '../models/Review';
import { Sample } from '../models/Sample';
import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { SEP } from '../models/SEP';
import { SepMeetingDecision } from '../models/SepMeetingDecision';
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

interface ProposalUnfeasibleEvent extends GeneralEvent {
  type: Event.PROPOSAL_UNFEASIBLE;
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

interface ProposalDeletedEvent extends GeneralEvent {
  type: Event.PROPOSAL_DELETED;
  proposal: Proposal;
}

interface ProposalRejectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_REJECTED;
  proposal: Proposal;
  reason: string;
}

interface ProposalReservedEvent extends GeneralEvent {
  type: Event.PROPOSAL_RESERVED;
  proposal: Proposal;
}

interface ProposalCreatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_CREATED;
  proposal: Proposal;
}

interface ProposalNotifiedEvent extends GeneralEvent {
  type: Event.PROPOSAL_NOTIFIED;
  proposal: Proposal;
}

interface ProposalClonedEvent extends GeneralEvent {
  type: Event.PROPOSAL_CLONED;
  proposal: Proposal;
}

interface ProposalManagementDecisionUpdatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_MANAGEMENT_DECISION_UPDATED;
  proposal: Proposal;
}

interface ProposalManagementDecisionSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED;
  proposal: Proposal;
}

interface ProposalFeasibilityReviewUpdatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FEASIBILITY_REVIEW_UPDATED;
  technicalreview: TechnicalReview;
}

interface ProposalFeasibilityReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED;
  technicalreview: TechnicalReview;
}

interface ProposalSEPReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_REVIEW_SUBMITTED;
  review: Review;
}

interface ProposalSEPReviewUpdatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_REVIEW_UPDATED;
  review: Review;
}

interface ProposalAllSEPReviewsSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED;
  proposal: Proposal;
}

interface ProposalSampleReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED;
  sample: Sample;
}

interface ProposalInstrumentSelectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_INSTRUMENT_SELECTED;
  instrumenthasproposals: InstrumentHasProposals;
}

interface ProposalSEPSelectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_SELECTED;
  proposalpks: ProposalPks;
}

interface ProposalInstrumentSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_INSTRUMENT_SUBMITTED;
  instrumenthasproposals: InstrumentHasProposals;
}

interface ProposalSEPMeetingSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_MEETING_SUBMITTED;
  proposal: Proposal;
}

interface ProposalStatusChangedByWorkflowEvent extends GeneralEvent {
  type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW;
  proposal: Proposal;
}

interface ProposalStatusChangedByUserEvent extends GeneralEvent {
  type: Event.PROPOSAL_STATUS_CHANGED_BY_USER;
  proposals: Proposals;
}

interface ProposalSEPMeetingSavedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_MEETING_SAVED;
  sepmeetingdecision: SepMeetingDecision;
}

interface ProposalSEPMeetingRankingOverwrittenEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN;
  sepmeetingdecision: SepMeetingDecision;
}

interface ProposalSEPMeetingReorderEvent extends GeneralEvent {
  type: Event.PROPOSAL_SEP_MEETING_REORDER;
  sepmeetingdecision: SepMeetingDecision;
}

interface ProposalTopicAnsweredEvent extends GeneralEvent {
  type: Event.TOPIC_ANSWERED;
  questionarystep: QuestionaryStep;
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

interface CallCreatedEvent extends GeneralEvent {
  type: Event.CALL_CREATED;
  call: Call;
}

interface CallEndedEvent extends GeneralEvent {
  type: Event.CALL_ENDED;
  call: Call;
}
interface CallEndedInternalEvent extends GeneralEvent {
  type: Event.CALL_ENDED_INTERNAL;
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

interface ProposalBookingTimeSlotAddedEvent extends GeneralEvent {
  type: Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED;
  scheduledEvent: ScheduledEventCore;
}

interface ProposalBookingTimeSlotsRemovedEvent extends GeneralEvent {
  type: Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED;
  scheduledEvents: ScheduledEventCore[];
}

interface InstrumentCreatedEvent extends GeneralEvent {
  type: Event.INSTRUMENT_CREATED;
  instrument: Instrument;
}
interface InstrumentUpdatedEvent extends GeneralEvent {
  type: Event.INSTRUMENT_UPDATED;
  instrument: Instrument;
}

interface InstrumentDeletedEvent extends GeneralEvent {
  type: Event.INSTRUMENT_DELETED;
  instrument: Instrument;
}

interface SEPReviewerNotified extends GeneralEvent {
  type: Event.SEP_REVIEWER_NOTIFIED;
  sepReview: Review;
}

export type ApplicationEvent =
  | ProposalAcceptedEvent
  | ProposalUpdatedEvent
  | ProposalDeletedEvent
  | ProposalSubmittedEvent
  | ProposalFeasibleEvent
  | ProposalUnfeasibleEvent
  | ProposalSampleSafeEvent
  | ProposalRejectedEvent
  | ProposalReservedEvent
  | ProposalCreatedEvent
  | ProposalClonedEvent
  | ProposalManagementDecisionUpdatedEvent
  | ProposalManagementDecisionSubmittedEvent
  | UserCreateEvent
  | EmailInvite
  | UserResetPasswordEmailEvent
  | UserUpdateEvent
  | UserRoleUpdateEvent
  | SEPCreatedEvent
  | SEPUpdatedEvent
  | SEPMembersAssignedEvent
  | SEPProposalRemovedEvent
  | SEPMemberRemovedEvent
  | SEPMemberAssignedToProposalEvent
  | SEPMemberRemovedFromProposalEvent
  | UserDeletedEvent
  | ProposalNotifiedEvent
  | CallCreatedEvent
  | CallEndedEvent
  | CallEndedInternalEvent
  | CallReviewEndedEvent
  | CallSEPReviewEndedEvent
  | ProposalFeasibilityReviewUpdatedEvent
  | ProposalFeasibilityReviewSubmittedEvent
  | ProposalSEPReviewUpdatedEvent
  | ProposalSEPReviewSubmittedEvent
  | ProposalAllSEPReviewsSubmittedEvent
  | ProposalSampleReviewSubmittedEvent
  | ProposalInstrumentSelectedEvent
  | ProposalSEPSelectedEvent
  | ProposalInstrumentSubmittedEvent
  | ProposalSEPMeetingSubmittedEvent
  | ProposalStatusChangedByWorkflowEvent
  | ProposalStatusChangedByUserEvent
  | ProposalSEPMeetingSavedEvent
  | ProposalSEPMeetingRankingOverwrittenEvent
  | ProposalSEPMeetingReorderEvent
  | ProposalTopicAnsweredEvent
  | ProposalBookingTimeSlotAddedEvent
  | ProposalBookingTimeSlotsRemovedEvent
  | InstrumentCreatedEvent
  | InstrumentUpdatedEvent
  | InstrumentDeletedEvent
  | SEPReviewerNotified;
