import { Call } from '../models/Call';
import { Fap, FapProposal } from '../models/Fap';
import { FapMeetingDecision } from '../models/FapMeetingDecision';
import { Instrument, InstrumentsHasProposals } from '../models/Instrument';
import { InternalReview } from '../models/InternalReview';
import { Invite } from '../models/Invite';
import { Proposal, ProposalPks, Proposals } from '../models/Proposal';
import { AnswerBasic } from '../models/Questionary';
import { Review } from '../models/Review';
import { Sample } from '../models/Sample';
import { ScheduledEventCore } from '../models/ScheduledEventCore';
import { TechnicalReview } from '../models/TechnicalReview';
import { Technique } from '../models/Technique';
import { User, UserRole } from '../models/User';
import { Event } from './event.enum';

interface GeneralEvent {
  type: Event;
  key: string;
  loggedInUserId: number | null;
  isRejection: boolean;
  inputArgs?: string;
  description?: string;
  exchange?: string;
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
  type: Event.PROPOSAL_FEASIBILITY_REVIEW_FEASIBLE;
  proposal: Proposal;
}

interface ProposalUnfeasibleEvent extends GeneralEvent {
  type: Event.PROPOSAL_FEASIBILITY_REVIEW_UNFEASIBLE;
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

interface ProposalALLFeasibilityReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_FEASIBILITY_REVIEWS_SUBMITTED;
  proposal: Proposal;
}

interface ProposalALLFeasibilityReviewFeasibleEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_FEASIBILITY_REVIEWS_FEASIBLE;
  proposal: Proposal;
}

interface ProposalFapReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_REVIEW_SUBMITTED;
  review: Review;
}

interface ProposalFapReviewUpdatedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_REVIEW_UPDATED;
  review: Review;
}

interface ProposalAllFapReviewsSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_FAP_REVIEWS_SUBMITTED;
  proposal: Proposal;
}

interface ProposalSampleReviewSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED;
  sample: Sample;
}

interface ProposalInstrumentSelectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_INSTRUMENTS_SELECTED;
  instrumentshasproposals: InstrumentsHasProposals;
}

interface ProposalFapsSelectedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAPS_SELECTED;
  proposalpks: ProposalPks;
}

interface ProposalInstrumentSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_MEETING_INSTRUMENT_SUBMITTED;
  instrumentshasproposals: InstrumentsHasProposals;
}

interface ProposalAllFapInstrumentSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_FAP_MEETING_INSTRUMENT_SUBMITTED;
  instrumentshasproposals: InstrumentsHasProposals;
}

interface ProposalInstrumentUnsubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_MEETING_INSTRUMENT_UNSUBMITTED;
  instrumentshasproposals: InstrumentsHasProposals;
}

interface ProposalFapMeetingSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_MEETING_SUBMITTED;
  proposal: Proposal;
}

interface FapAllMeetingsSubmittedEvent extends GeneralEvent {
  type: Event.FAP_ALL_MEETINGS_SUBMITTED;
  fap: Fap;
}

interface ProposalAllFapReviewsSubmittedForAllPanelsEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_REVIEWS_SUBMITTED_FOR_ALL_FAPS;
  proposal: Proposal;
}

interface ProposalAllFapMeetingsSubmittedEvent extends GeneralEvent {
  type: Event.PROPOSAL_ALL_FAP_MEETINGS_SUBMITTED;
  proposal: Proposal;
}

interface ProposalStatusChangedByWorkflowEvent extends GeneralEvent {
  type: Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW;
  proposal: Proposal;
}

interface ProposalStatusActionExecutedEvent extends GeneralEvent {
  type: Event.PROPOSAL_STATUS_ACTION_EXECUTED;
  proposal: Proposal;
}

interface ProposalStatusChangedByUserEvent extends GeneralEvent {
  type: Event.PROPOSAL_STATUS_CHANGED_BY_USER;
  proposals: Proposals;
}

interface ProposalFapMeetingSavedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_MEETING_SAVED;
  fapmeetingdecision: FapMeetingDecision;
}

interface ProposalFapMeetingRankingOverwrittenEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_MEETING_RANKING_OVERWRITTEN;
  fapmeetingdecision: FapMeetingDecision;
}

interface ProposalFapMeetingReorderEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAP_MEETING_REORDER;
  fapmeetingdecision: FapMeetingDecision;
}

interface ProposalTopicAnsweredEvent extends GeneralEvent {
  type: Event.TOPIC_ANSWERED;
  array: AnswerBasic[];
}

interface UserUpdateEvent extends GeneralEvent {
  type: Event.USER_UPDATED;
  user: User;
}

interface UserRoleUpdateEvent extends GeneralEvent {
  type: Event.USER_ROLE_UPDATED;
  user: User;
}

interface UserDeletedEvent extends GeneralEvent {
  type: Event.USER_DELETED;
  user: User;
}

interface EmailInviteOld extends GeneralEvent {
  type: Event.EMAIL_INVITE_LEGACY;
  emailinviteresponse: {
    userId: number;
    inviterId: number;
    role: UserRole;
  };
}

type InviteResponse = Pick<
  Invite,
  'id' | 'code' | 'email' | 'note' | 'createdByUserId' | 'isEmailSent'
>;

interface EmailInvite extends GeneralEvent {
  type: Event.EMAIL_INVITE;
  invite: InviteResponse;
}

interface EmailInvites extends GeneralEvent {
  type: Event.EMAIL_INVITES;
  array: InviteResponse[];
}

interface FapCreatedEvent extends GeneralEvent {
  type: Event.FAP_CREATED;
  fap: Fap;
}

interface FapUpdatedEvent extends GeneralEvent {
  type: Event.FAP_UPDATED;
  fap: Fap;
}

interface FapMembersAssignedEvent extends GeneralEvent {
  type: Event.FAP_MEMBERS_ASSIGNED;
  fap: Fap;
}

interface FapMemberAssignedToProposalEvent extends GeneralEvent {
  type: Event.FAP_MEMBER_ASSIGNED_TO_PROPOSAL;
  fap: Fap;
}

interface FapMemberRemovedFromProposalEvent extends GeneralEvent {
  type: Event.FAP_MEMBER_REMOVED_FROM_PROPOSAL;
  fap: Fap;
}

interface FapProposalRemovedEvent extends GeneralEvent {
  type: Event.PROPOSAL_FAPS_REMOVED;
  array: FapProposal[];
}

interface FapMemberRemovedEvent extends GeneralEvent {
  type: Event.FAP_MEMBER_REMOVED;
  fap: Fap;
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

interface CallFapReviewEndedEvent extends GeneralEvent {
  type: Event.CALL_FAP_REVIEW_ENDED;
  call: Call;
}

interface InviteAcceptedEvent extends GeneralEvent {
  type: Event.INVITE_ACCEPTED;
  invite: Invite;
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

interface FapReviewerNotified extends GeneralEvent {
  type: Event.FAP_REVIEWER_NOTIFIED;
  fapReview: Review;
}

interface TechniqueCreatedEvent extends GeneralEvent {
  type: Event.TECHNIQUE_CREATED;
  technique: Technique;
}

interface TechniqueUpdatedEvent extends GeneralEvent {
  type: Event.TECHNIQUE_UPDATED;
  technique: Technique;
}

interface TechniqueDeletedEvent extends GeneralEvent {
  type: Event.TECHNIQUE_DELETED;
  technique: Technique;
}

interface InstrumentsAssignedToTechniqueEvent extends GeneralEvent {
  type: Event.INSTRUMENTS_ASSIGNED_TO_TECHNIQUE;
  boolean: boolean;
}

interface InstrumentsRemovedFromTechniqueEvent extends GeneralEvent {
  type: Event.INSTRUMENTS_REMOVED_FROM_TECHNIQUE;
  boolean: boolean;
}

interface ProposalAssignedToTechniquesEvent extends GeneralEvent {
  type: Event.PROPOSAL_ASSIGNED_TO_TECHNIQUES;
  boolean: boolean;
}

interface InternalReviewCreated extends GeneralEvent {
  type: Event.INTERNAL_REVIEW_CREATED;
  internalreview: InternalReview;
}

interface InternalReviewUpdated extends GeneralEvent {
  type: Event.INTERNAL_REVIEW_UPDATED;
  internalreview: InternalReview;
}

interface InternalReviewDeleted extends GeneralEvent {
  type: Event.INTERNAL_REVIEW_DELETED;
  internalreview: InternalReview;
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
  | EmailInviteOld
  | EmailInvite
  | EmailInvites
  | UserUpdateEvent
  | UserRoleUpdateEvent
  | FapCreatedEvent
  | FapUpdatedEvent
  | FapMembersAssignedEvent
  | FapProposalRemovedEvent
  | FapMemberRemovedEvent
  | FapMemberAssignedToProposalEvent
  | FapMemberRemovedFromProposalEvent
  | UserDeletedEvent
  | ProposalNotifiedEvent
  | CallCreatedEvent
  | CallEndedEvent
  | CallEndedInternalEvent
  | CallReviewEndedEvent
  | CallFapReviewEndedEvent
  | InviteAcceptedEvent
  | ProposalFeasibilityReviewUpdatedEvent
  | ProposalFeasibilityReviewSubmittedEvent
  | ProposalALLFeasibilityReviewSubmittedEvent
  | ProposalALLFeasibilityReviewFeasibleEvent
  | ProposalFapReviewUpdatedEvent
  | ProposalFapReviewSubmittedEvent
  | ProposalAllFapReviewsSubmittedEvent
  | ProposalSampleReviewSubmittedEvent
  | ProposalInstrumentSelectedEvent
  | ProposalFapsSelectedEvent
  | ProposalInstrumentSubmittedEvent
  | ProposalInstrumentUnsubmittedEvent
  | ProposalFapMeetingSubmittedEvent
  | ProposalStatusChangedByWorkflowEvent
  | ProposalStatusChangedByUserEvent
  | ProposalFapMeetingSavedEvent
  | ProposalFapMeetingRankingOverwrittenEvent
  | ProposalFapMeetingReorderEvent
  | ProposalTopicAnsweredEvent
  | ProposalBookingTimeSlotAddedEvent
  | ProposalBookingTimeSlotsRemovedEvent
  | FapAllMeetingsSubmittedEvent
  | ProposalAllFapReviewsSubmittedForAllPanelsEvent
  | ProposalAllFapMeetingsSubmittedEvent
  | ProposalAllFapInstrumentSubmittedEvent
  | InstrumentCreatedEvent
  | InstrumentUpdatedEvent
  | InstrumentDeletedEvent
  | FapReviewerNotified
  | ProposalStatusActionExecutedEvent
  | TechniqueCreatedEvent
  | TechniqueUpdatedEvent
  | TechniqueDeletedEvent
  | InstrumentsAssignedToTechniqueEvent
  | InstrumentsRemovedFromTechniqueEvent
  | ProposalAssignedToTechniquesEvent
  | InternalReviewCreated
  | InternalReviewUpdated
  | InternalReviewDeleted;
