// NOTE: When creating new event we need to follow the same name standardization/convention: [WHERE]_[WHAT]
export enum Event {
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_UPDATED = 'PROPOSAL_UPDATED',
  PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED',
  PROPOSAL_DELETED = 'PROPOSAL_DELETED',
  PROPOSAL_FEASIBLE = 'PROPOSAL_FEASIBLE',
  PROPOSAL_UNFEASIBLE = 'PROPOSAL_UNFEASIBLE',
  PROPOSAL_SEP_SELECTED = 'PROPOSAL_SEP_SELECTED',
  PROPOSAL_INSTRUMENT_SELECTED = 'PROPOSAL_INSTRUMENT_SELECTED',
  PROPOSAL_FEASIBILITY_REVIEW_UPDATED = 'PROPOSAL_FEASIBILITY_REVIEW_UPDATED',
  PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED = 'PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_REVIEW_SUBMITTED = 'PROPOSAL_SAMPLE_REVIEW_SUBMITTED',
  PROPOSAL_SAMPLE_SAFE = 'PROPOSAL_SAMPLE_SAFE',
  PROPOSAL_ALL_SEP_REVIEWERS_SELECTED = 'PROPOSAL_ALL_SEP_REVIEWERS_SELECTED',
  PROPOSAL_SEP_REVIEW_UPDATED = 'PROPOSAL_SEP_REVIEW_UPDATED',
  PROPOSAL_SEP_REVIEW_SUBMITTED = 'PROPOSAL_SEP_REVIEW_SUBMITTED',
  PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED = 'PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED',
  PROPOSAL_SEP_MEETING_SAVED = 'PROPOSAL_SEP_MEETING_SAVED',
  PROPOSAL_SEP_MEETING_SUBMITTED = 'PROPOSAL_SEP_MEETING_SUBMITTED',
  PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN = 'PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN',
  PROPOSAL_SEP_MEETING_REORDER = 'PROPOSAL_SEP_MEETING_REORDER',
  PROPOSAL_MANAGEMENT_DECISION_UPDATED = 'PROPOSAL_MANAGEMENT_DECISION_UPDATED',
  PROPOSAL_MANAGEMENT_DECISION_SUBMITTED = 'PROPOSAL_MANAGEMENT_DECISION_SUBMITTED',
  PROPOSAL_INSTRUMENT_SUBMITTED = 'PROPOSAL_INSTRUMENT_SUBMITTED',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROPOSAL_RESERVED = 'PROPOSAL_RESERVED',
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',
  PROPOSAL_STATUS_UPDATED = 'PROPOSAL_STATUS_UPDATED',
  CALL_CREATED = 'CALL_CREATED',
  CALL_ENDED = 'CALL_ENDED',
  CALL_ENDED_INTERNAL = 'CALL_ENDED_INTERNAL',
  CALL_REVIEW_ENDED = 'CALL_REVIEW_ENDED',
  CALL_SEP_REVIEW_ENDED = 'CALL_SEP_REVIEW_ENDED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_ROLE_UPDATED = 'USER_ROLE_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_PASSWORD_RESET_EMAIL = 'USER_PASSWORD_RESET_EMAIL',
  EMAIL_INVITE = 'EMAIL_INVITE',
  SEP_CREATED = 'SEP_CREATED',
  SEP_UPDATED = 'SEP_UPDATED',
  SEP_MEMBERS_ASSIGNED = 'SEP_MEMBERS_ASSIGNED',
  SEP_MEMBER_REMOVED = 'SEP_MEMBER_REMOVED',
  SEP_PROPOSAL_REMOVED = 'SEP_PROPOSAL_REMOVED',
  SEP_MEMBER_ASSIGNED_TO_PROPOSAL = 'SEP_MEMBER_ASSIGNED_TO_PROPOSAL',
  SEP_MEMBER_REMOVED_FROM_PROPOSAL = 'SEP_MEMBER_REMOVED_FROM_PROPOSAL',
  SEP_REVIEWER_NOTIFIED = 'SEP_REVIEWER_NOTIFIED',
  PROPOSAL_NOTIFIED = 'PROPOSAL_NOTIFIED',
  PROPOSAL_CLONED = 'PROPOSAL_CLONED',
  PROPOSAL_STATUS_CHANGED_BY_WORKFLOW = 'PROPOSAL_STATUS_CHANGED_BY_WORKFLOW',
  PROPOSAL_STATUS_CHANGED_BY_USER = 'PROPOSAL_STATUS_CHANGED_BY_USER',
  TOPIC_ANSWERED = 'TOPIC_ANSWERED',
  PROPOSAL_BOOKING_TIME_SLOT_ADDED = 'PROPOSAL_BOOKING_TIME_SLOT_ADDED',
  PROPOSAL_BOOKING_TIME_SLOTS_REMOVED = 'PROPOSAL_BOOKING_TIME_SLOTS_REMOVED',
  PROPOSAL_BOOKING_TIME_ACTIVATED = 'PROPOSAL_BOOKING_TIME_ACTIVATED',
  PROPOSAL_BOOKING_TIME_COMPLETED = 'PROPOSAL_BOOKING_TIME_COMPLETED',
  PROPOSAL_BOOKING_TIME_UPDATED = 'PROPOSAL_BOOKING_TIME_UPDATED',
  PROPOSAL_BOOKING_TIME_REOPENED = 'PROPOSAL_BOOKING_TIME_REOPENED',
  INSTRUMENT_DELETED = 'INSTRUMENT_DELETED',
  PREDEFINED_MESSAGE_CREATED = 'PREDEFINED_MESSAGE_CREATED',
  PREDEFINED_MESSAGE_UPDATED = 'PREDEFINED_MESSAGE_UPDATED',
  PREDEFINED_MESSAGE_DELETED = 'PREDEFINED_MESSAGE_DELETED',
}

export const EventLabel = new Map<Event, string>([
  [Event.PROPOSAL_CREATED, 'Event occurs when proposal is created'],
  [Event.PROPOSAL_UPDATED, 'Event occurs when proposal is updated'],
  [Event.PROPOSAL_SUBMITTED, 'Event occurs when proposal is submitted'],
  [Event.PROPOSAL_DELETED, 'Event occurs when proposal is removed'],
  [
    Event.PROPOSAL_FEASIBLE,
    'Event occurs when proposal feasibility review is submitted with value of feasible',
  ],
  [
    Event.PROPOSAL_UNFEASIBLE,
    'Event occurs when proposal feasibility review is submitted with value of unfeasible',
  ],
  [
    Event.PROPOSAL_SEP_SELECTED,
    'Event occurs when SEP gets assigned to a proposal',
  ],
  [
    Event.PROPOSAL_INSTRUMENT_SELECTED,
    'Event occurs when instrument gets assigned to a proposal',
  ],
  [
    Event.PROPOSAL_FEASIBILITY_REVIEW_UPDATED,
    'Event occurs when proposal feasibility review is updated',
  ],
  [
    Event.PROPOSAL_FEASIBILITY_REVIEW_SUBMITTED,
    'Event occurs when proposal feasibility review is submitted with any value',
  ],
  [
    Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED,
    'Event occurs when proposal sample review gets submitted with any value',
  ],
  [
    Event.PROPOSAL_SAMPLE_SAFE,
    'Event occurs when proposal sample review gets submitted with value of low risk',
  ],
  [
    Event.PROPOSAL_ALL_SEP_REVIEWERS_SELECTED,
    'Event occurs when all SEP reviewers are selected on a proposal',
  ],
  [
    Event.PROPOSAL_SEP_REVIEW_UPDATED,
    'Event occurs when at least one proposal SEP review is updated',
  ],
  [
    Event.PROPOSAL_SEP_REVIEW_SUBMITTED,
    'Event occurs when at least one proposal SEP review is submitted',
  ],
  [
    Event.PROPOSAL_ALL_SEP_REVIEWS_SUBMITTED,
    'Event occurs when all SEP reviews on a proposal are submitted',
  ],
  [
    Event.PROPOSAL_SEP_MEETING_SAVED,
    'Event occurs when SEP meeting is saved on a proposal',
  ],
  [
    Event.PROPOSAL_SEP_MEETING_SUBMITTED,
    'Event occurs when SEP meeting is submitted on a proposal',
  ],
  [
    Event.PROPOSAL_SEP_MEETING_RANKING_OVERWRITTEN,
    'Event occurs when SEP meeting ranking is overwritten on a proposal',
  ],
  [
    Event.PROPOSAL_SEP_MEETING_REORDER,
    'Event occurs when proposals are reordered in SEP meeting components',
  ],
  [
    Event.PROPOSAL_INSTRUMENT_SUBMITTED,
    'Event occurs when instrument is submitted after SEP meeting is finalized',
  ],
  [
    Event.PROPOSAL_ACCEPTED,
    'Event occurs when proposal gets final decision as accepted',
  ],
  [
    Event.PROPOSAL_MANAGEMENT_DECISION_UPDATED,
    'Event occurs when proposal management decision is updated',
  ],
  [
    Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED,
    'Event occurs when proposal management decision is submitted',
  ],
  [Event.PROPOSAL_REJECTED, 'Event occurs when proposal gets rejected'],
  [Event.PROPOSAL_RESERVED, 'Event occurs when proposal gets reserved'],
  [
    Event.PROPOSAL_STATUS_UPDATED,
    'Event occurs when proposal status gets updated manually',
  ],
  [
    Event.CALL_ENDED,
    'Event occurs on a specific call end date set on the call',
  ],
  [
    Event.CALL_ENDED_INTERNAL,
    'Event occurs on a specific call  internal end date set on the call',
  ],
  [Event.CALL_CREATED, 'Event occurs on a when a call is created'],
  [
    Event.CALL_REVIEW_ENDED,
    'Event occurs on a specific call review end date set on the call',
  ],
  [
    Event.CALL_SEP_REVIEW_ENDED,
    'Event occurs on a specific call SEP review end date set on the call',
  ],
  [Event.USER_CREATED, 'Event occurs when user is created'],
  [Event.USER_UPDATED, 'Event occurs when user is updated'],
  [Event.USER_ROLE_UPDATED, 'Event occurs when user roles are updated'],
  [Event.USER_DELETED, 'Event occurs when user is removed'],
  [
    Event.USER_PASSWORD_RESET_EMAIL,
    'Event occurs when user password is reset by email',
  ],
  [Event.EMAIL_INVITE, 'Event occurs when user is created using email invite'],
  [Event.SEP_CREATED, 'Event occurs when SEP is created'],
  [Event.SEP_UPDATED, 'Event occurs when SEP is updated'],
  [Event.SEP_MEMBERS_ASSIGNED, 'Event occurs when we assign member/s to a SEP'],
  [
    Event.SEP_REVIEWER_NOTIFIED,
    'Event occurs when we notify the SEP reviewer, about its not submitted review, by email 2 days before the review end date',
  ],
  [
    Event.SEP_MEMBER_REMOVED,
    'Event occurs when SEP member gets removed from the panel',
  ],
  [
    Event.SEP_PROPOSAL_REMOVED,
    'Event occurs when proposal is removed from a SEP',
  ],
  [
    Event.SEP_MEMBER_ASSIGNED_TO_PROPOSAL,
    'Event occurs when SEP member gets assigned to a proposal for a review',
  ],
  [
    Event.SEP_MEMBER_REMOVED_FROM_PROPOSAL,
    'Event occurs when SEP member is removed from proposal for review',
  ],
  [Event.PROPOSAL_NOTIFIED, 'Event occurs when proposal is notified'],
  [Event.PROPOSAL_CLONED, 'Event occurs when proposal is cloned'],
  [
    Event.PROPOSAL_STATUS_CHANGED_BY_WORKFLOW,
    'Event occurs when the proposal status was changed by the workflow engine',
  ],
  [
    Event.PROPOSAL_STATUS_CHANGED_BY_USER,
    'Event occurs when the proposal status was changed by the user',
  ],
  [
    Event.TOPIC_ANSWERED,
    'Event occurs when the user clicks save on a topic in any questionary',
  ],
  [
    Event.PROPOSAL_BOOKING_TIME_SLOT_ADDED,
    'Event occurs when the new time slot is booked in the scheduler',
  ],
  [
    Event.PROPOSAL_BOOKING_TIME_SLOTS_REMOVED,
    'Event occurs when the time slots are removed in the scheduler',
  ],
  [
    Event.PROPOSAL_BOOKING_TIME_ACTIVATED,
    'Event occurs when the time slot booking is activated in the scheduler',
  ],
  [
    Event.PROPOSAL_BOOKING_TIME_COMPLETED,
    'Event occurs when the time slot booking is completed in the scheduler',
  ],
  [
    Event.PROPOSAL_BOOKING_TIME_UPDATED,
    'Event occurs when the time slot booking is updated in the scheduler',
  ],
  [
    Event.PROPOSAL_BOOKING_TIME_REOPENED,
    'Event occurs when the time slot booking is re-opened in the scheduler',
  ],
  [Event.INSTRUMENT_DELETED, 'Event occurs when the instrument is removed'],
  [
    Event.PREDEFINED_MESSAGE_CREATED,
    'Event occurs when predefined message is created',
  ],
  [
    Event.PREDEFINED_MESSAGE_UPDATED,
    'Event occurs when predefined message is updated',
  ],
  [
    Event.PREDEFINED_MESSAGE_DELETED,
    'Event occurs when predefined message is removed',
  ],
]);
