import { PdfTemplateRecord } from 'knex/types/tables';

import { Page } from '../../models/Admin';
import { FileMetadata } from '../../models/Blob';
import { AllocationTimeUnits, Call } from '../../models/Call';
import { CallHasInstrument } from '../../models/CallHasInstrument';
import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '../../models/ConditionEvaluator';
import { Country } from '../../models/Country';
import { Fap, FapAssignment, FapProposal, FapReviewer } from '../../models/Fap';
import { FapMeetingDecision } from '../../models/FapMeetingDecision';
import { Feature, FeatureId } from '../../models/Feature';
import { Feedback } from '../../models/Feedback';
import { FeedbackRequest } from '../../models/FeedbackRequest';
import { GenericTemplate } from '../../models/GenericTemplate';
import { Institution } from '../../models/Institution';
import { Instrument } from '../../models/Instrument';
import { PdfTemplate } from '../../models/PdfTemplate';
import { PredefinedMessage } from '../../models/PredefinedMessage';
import { Proposal, ProposalEndStatus } from '../../models/Proposal';
import { ProposalStatusActionType } from '../../models/ProposalStatusAction';
import { ProposalView } from '../../models/ProposalView';
import { Quantity } from '../../models/Quantity';
import { AnswerBasic, Questionary } from '../../models/Questionary';
import {
  createConfig,
  getTransformedConfigData,
  QuestionDataTypeConfigMapping,
} from '../../models/questionTypes/QuestionRegistry';
import { RedeemCode } from '../../models/RedeemCode';
import { Review } from '../../models/Review';
import { Role } from '../../models/Role';
import { Sample } from '../../models/Sample';
import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { Settings, SettingsId } from '../../models/Settings';
import { Shipment, ShipmentStatus } from '../../models/Shipment';
import { TechnicalReview } from '../../models/TechnicalReview';
import {
  DataType,
  FieldCondition,
  FieldDependency,
  Question,
  QuestionTemplateRelation,
  Template,
  TemplateCategory,
  TemplateGroup,
  TemplateGroupId,
  Topic,
} from '../../models/Template';
import { Unit } from '../../models/Unit';
import { BasicUserDetails, User } from '../../models/User';
import { Visit, VisitStatus } from '../../models/Visit';
import { VisitRegistration } from '../../models/VisitRegistration';
import {
  ProposalBookingStatusCore,
  ScheduledEventBookingType,
} from '../../resolvers/types/ProposalBooking';
import {
  FapInstrument,
  ProposalViewFap,
  ProposalViewInstrument,
  ProposalViewTechnicalReview,
  ProposalViewTechnique,
} from '../../resolvers/types/ProposalView';
import { ExperimentSafetyInput } from './../../models/ExperimentSafetyInput';
import { FeedbackStatus } from './../../models/Feedback';

// Adds types to datasources: https://knexjs.org/guide/#typescript
declare module 'knex/types/tables' {
  export interface PdfTemplateRecord {
    readonly pdf_template_id: number;
    readonly template_id: number;
    readonly template_data: string;
    readonly template_header: string;
    readonly template_footer: string;
    readonly template_sample_declaration: string;
    readonly dummy_data: string;
    readonly creator_id: number;
    readonly created_at: Date;
  }

  interface Tables {
    pdf_templates: PdfTemplateRecord;
    techniques: TechniqueRecord;
    technique_has_instruments: TechniqueHasInstrumentsRecord;
  }
}

// Interfaces corresponding exactly to database tables

export interface ProposalUserRecord {
  readonly proposal_pk: number;
  readonly user_id: number;
}

export interface QuestionaryRecord {
  readonly questionary_id: number;
  readonly template_id: number;
  readonly creator_id: number;
  readonly created_at: Date;
}

export interface ScheduledEventRecord {
  readonly scheduled_event_id: number;
  readonly booking_type: ScheduledEventBookingType;
  readonly starts_at: Date;
  readonly ends_at: Date;
  readonly proposal_booking_id: number;
  readonly proposal_pk: number;
  readonly status: ProposalBookingStatusCore;
  readonly local_contact: number | null;
  readonly instrument_id: number;
}

export interface ProposalRecord {
  readonly proposal_pk: number;
  readonly title: string;
  readonly abstract: string;
  readonly proposer_id: number;
  readonly status_id: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
  readonly proposal_id: string;
  readonly final_status: number;
  readonly call_id: number;
  readonly questionary_id: number;
  readonly template_id: number;
  readonly comment_for_user: string;
  readonly comment_for_management: string;
  readonly notified: boolean;
  readonly submitted: boolean;
  readonly reference_number_sequence: number;
  readonly management_decision_submitted: boolean;
  readonly submitted_date: Date;
}
export interface ProposalViewRecord {
  readonly proposal_pk: number;
  readonly title: string;
  readonly principal_investigator: number;
  readonly proposal_status_id: number;
  readonly proposal_status_name: string;
  readonly proposal_status_description: string;
  readonly proposal_id: string;
  readonly final_status: number;
  readonly notified: boolean;
  readonly submitted: boolean;
  readonly instruments: ProposalViewInstrument[];
  readonly technical_reviews: ProposalViewTechnicalReview[];
  readonly faps: ProposalViewFap[];
  readonly fap_instruments: FapInstrument[];
  readonly call_short_code: string;
  readonly call_id: number;
  readonly proposal_workflow_id: number;
  readonly allocation_time_unit: AllocationTimeUnits;
  readonly full_count: number;
  readonly submitted_date: Date;
  readonly techniques: ProposalViewTechnique[];
}

export interface TopicRecord {
  readonly topic_id: number;
  readonly topic_title: string;
  readonly template_id: number;
  readonly is_enabled: boolean;
  readonly sort_order: number;
}

export interface FieldDependencyRecord {
  readonly question_id: string;
  readonly proposal_question_dependency: string;
  readonly condition: string;
}

export interface QuestionRecord {
  readonly category_id: number;
  readonly question_id: string;
  readonly data_type: DataType;
  readonly question: string;
  readonly default_config: string;
  readonly sort_order: number;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly natural_key: string;
}

export interface AnswerRecord {
  readonly answer_id: number;
  readonly questionary_id: number;
  readonly question_id: string;
  readonly answer: string;
  readonly created_at: Date;
}

export interface Dependency {
  condition: DependencyCondition;
  dependencyId: string;
}

export interface DependencyCondition {
  condition: EvaluatorOperator;
  params: string | boolean | number;
}

export interface QuestionDependencyRecord {
  readonly question_dependency_id: number;
  readonly question_id: string;
  readonly template_id: number;
  readonly dependency_question_id: string;
  readonly dependency_condition: DependencyCondition;
}

export interface QuestionTemplateRelRecord {
  readonly question_id: string;
  readonly template_id: number;
  readonly topic_id: number;
  readonly sort_order: number;
  readonly dependencies_operator?: DependenciesLogicOperator;
  readonly config: string;
}

export interface TemplateRecord {
  readonly template_id: number;
  readonly group_id: string;
  readonly name: string;
  readonly description: string;
  readonly is_archived: boolean;
}

export interface UserRecord {
  readonly user_id: number;
  readonly user_title: string;
  readonly firstname: string;
  readonly middlename: string;
  readonly lastname: string;
  readonly username: string;
  readonly preferredname: string;
  readonly oidc_sub: string | null;
  readonly oauth_refresh_token: string | null;
  readonly oauth_issuer: string | null;
  readonly gender: string;
  readonly nationality: number;
  readonly birthdate: Date;
  readonly department: string;
  readonly position: string;
  readonly email: string;
  readonly telephone: string;
  readonly telephone_alt: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
  readonly institution_id: number;
  readonly institution: string;
  readonly placeholder: boolean;
}

export interface VisitRegistrationRecord {
  user_id: number;
  visit_id: number;
  registration_questionary_id: number | null;
  is_registration_submitted: boolean;
  training_expiry_date: Date | null;
  starts_at: Date | null;
  ends_at: Date | null;
}

export interface RoleRecord {
  readonly role_id: number;
  readonly short_code: string;
  readonly title: string;
}

export interface ReviewRecord {
  readonly review_id: number;
  readonly user_id: number;
  readonly proposal_pk: number;
  readonly comment: string;
  readonly grade: number;
  readonly status: number;
  readonly fap_id: number;
  readonly questionary_id: number;
  readonly full_count: number;
}

export interface TechnicalReviewRecord {
  readonly technical_review_id: number;
  readonly proposal_pk: number;
  readonly comment: string;
  readonly public_comment: string;
  readonly time_allocation: number;
  readonly status: number;
  readonly submitted: boolean;
  readonly reviewer_id: number;
  readonly files: string;
  readonly technical_review_assignee_id: number | null;
  readonly instrument_id: number;
}

export interface InternalReviewRecord {
  readonly internal_review_id: number;
  readonly title: string;
  readonly comment: string;
  readonly reviewer_id: number;
  readonly technical_review_id: number;
  readonly files: string;
  readonly created_at: Date;
  readonly assigned_by: number;
}

export interface CallRecord {
  readonly call_id: number;
  readonly call_short_code: string;
  readonly start_call: Date;
  readonly end_call: Date;
  readonly end_call_internal: Date;
  readonly start_review: Date;
  readonly end_review: Date;
  readonly start_fap_review: Date;
  readonly end_fap_review: Date;
  readonly start_notify: Date;
  readonly end_notify: Date;
  readonly start_cycle: Date;
  readonly end_cycle: Date;
  readonly cycle_comment: string;
  readonly survey_comment: string;
  readonly submission_message: string;
  readonly reference_number_format: string;
  readonly proposal_sequence: number;
  readonly proposal_workflow_id: number;
  readonly call_ended: boolean;
  readonly call_ended_internal: boolean;
  readonly call_review_ended: boolean;
  readonly call_fap_review_ended: boolean;
  readonly template_id: number;
  readonly esi_template_id: number;
  readonly allocation_time_unit: AllocationTimeUnits;
  readonly title: string;
  readonly description: string;
  readonly pdf_template_id: number;
  readonly fap_review_template_id: number;
  readonly is_active: boolean;
}

export interface PageTextRecord {
  readonly pagetext_id: number;
  readonly content: string;
}

export interface NationalityRecord {
  readonly nationality_id: number;
  readonly nationality: string;
}

export interface InstitutionRecord {
  readonly institution_id: number;
  readonly institution: string;
  readonly country_id: number;
  readonly ror_id: string;
}

export interface UnitRecord {
  readonly unit_id: string;
  readonly unit: string;
  readonly quantity: string;
  readonly symbol: string;
  readonly si_conversion_formula: string;
}

export interface PredefinedMessageRecord {
  readonly predefined_message_id: number;
  readonly title: string;
  readonly message: string;
  readonly date_modified: Date;
  readonly last_modified_by: number;
}

export interface CountryRecord {
  readonly country_id: number;
  readonly country: string;
}

export interface FileRecord {
  readonly file_id: string;
  readonly file_name: string;
  readonly size_in_bytes: number;
  readonly mime_type: string;
  readonly oid: number;
  readonly created_at: Date;
}

export interface EventLogRecord {
  readonly id: number;
  readonly changed_by: number | null;
  readonly event_type: string;
  readonly row_data: string;
  readonly event_tstamp: Date;
  readonly changed_object_id: string;
  readonly description: string;
}

export interface FapRecord {
  readonly fap_id: number;
  readonly code: string;
  readonly description: string;
  readonly number_ratings_required: number;
  readonly grade_guide: string;
  readonly custom_grade_guide: boolean | null;
  readonly active: boolean;
  readonly full_count: number;
  readonly files: string | null;
}

export interface FapSecretariesRecord {
  readonly user_id: number;
  readonly fap_id: number;
}

export interface FapChairsRecord {
  readonly user_id: number;
  readonly fap_id: number;
}

export interface FapProposalRecord {
  readonly fap_proposal_id: number;
  readonly proposal_pk: number;
  readonly fap_id: number;
  readonly date_assigned: Date;
  readonly fap_time_allocation: number | null;
  readonly instrument_id: number | null;
  readonly call_id: number;
  readonly fap_meeting_instrument_submitted: boolean;
}

export type AssignProposalsToFapsInput = Pick<
  FapProposalRecord,
  'call_id' | 'fap_id' | 'instrument_id' | 'proposal_pk'
> & { instrument_has_proposals_id: number };

export interface FapAssignmentRecord {
  readonly proposal_pk: number;
  readonly fap_member_user_id: number;
  readonly fap_id: number;
  readonly date_assigned: Date;
  readonly reassigned: boolean;
  readonly date_reassigned: Date;
  readonly email_sent: boolean;
  readonly rank: number | null;
}

export interface FapReviewsRecord {
  readonly proposal_pk: number;
  readonly proposal_id: number;
  readonly title: string;
  readonly instrument_name: string;
  readonly availability_time: number;
  readonly time_allocation: number;
  readonly fap_id: number;
  readonly rank_order: number;
  readonly call_id: number;
  readonly proposer_id: number;
  readonly instrument_id: number;
  readonly fap_time_allocation: number;
  readonly average_grade: number;
  readonly questionary_id: number;
  readonly comment: string;
}

export interface FapReviewerRecord {
  readonly user_id: number;
  readonly fap_id: number;
}

export interface RoleUserRecord {
  readonly role_user_id: number;
  readonly role_id: number;
  readonly user_id: number;
}

export interface InstrumentRecord {
  readonly instrument_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly manager_user_id: number;
  readonly full_count: number;
}

export interface InstrumentHasProposalRecord {
  readonly instrument_id: number;
  readonly proposal_pk: number;
  readonly submitted: boolean;
  readonly instrument_has_proposals_id: number;
}

export interface CallHasInstrumentRecord {
  readonly call_id: number;
  readonly instrument_id: number;
  availability_time: number;
  submitted: boolean;
  fap_id: number;
}
export interface InstrumentWithAvailabilityTimeRecord {
  readonly instrument_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly manager_user_id: number;
  readonly availability_time: number | null;
  readonly submitted: boolean;
  readonly proposal_count: number;
  readonly full_count: number;
  readonly fap_id: number;
  readonly all_faps_instrument_time_allocation: number;
  readonly fap_instrument_time_allocation: number;
}

export interface InstrumentWithManagementTimeRecord {
  readonly instrument_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly manager_user_id: number;
  readonly management_time_allocation: number;
  readonly submitted: boolean;
}

export interface TemplateCategoryRecord {
  readonly template_category_id: number;
  readonly name: string;
}

export interface SampleRecord {
  readonly created_at: Date;
  readonly creator_id: number;
  readonly is_post_proposal_submission: boolean;
  readonly proposal_pk: number;
  readonly question_id: string;
  readonly questionary_id: number;
  readonly safety_comment: string;
  readonly safety_status: number;
  readonly sample_id: number;
  readonly shipment_id: number;
  readonly title: string;
}

export interface ShipmentRecord {
  readonly scheduled_event_id: number;
  readonly shipment_id: number;
  readonly title: string;
  readonly creator_id: number;
  readonly proposal_pk: number;
  readonly questionary_id: number;
  readonly status: string;
  readonly external_ref: string;
  readonly created_at: Date;
}

export interface ProposalStatusRecord {
  readonly proposal_status_id: number;
  readonly short_code: string;
  readonly name: string;
  readonly description: string;
  readonly is_default: boolean;
  readonly full_count: number;
}

export interface ProposalWorkflowRecord {
  readonly proposal_workflow_id: number;
  readonly name: string;
  readonly description: string;
  readonly full_count: number;
}

export interface ProposalWorkflowConnectionRecord {
  readonly proposal_workflow_connection_id: number;
  readonly sort_order: number;
  readonly proposal_workflow_id: number;
  readonly proposal_status_id: number;
  readonly next_proposal_status_id: number | null;
  readonly prev_proposal_status_id: number | null;
  readonly droppable_group_id: string;
  readonly parent_droppable_group_id: string;
}

export interface StatusChangingEventRecord {
  readonly status_changing_event_id: number;
  readonly proposal_workflow_connection_id: number;
  readonly status_changing_event: string;
}

export interface FapMeetingDecisionRecord {
  readonly proposal_pk: number;
  readonly comment_for_management: string;
  readonly comment_for_user: string;
  readonly rank_order: number;
  readonly recommendation: ProposalEndStatus;
  readonly submitted: boolean;
  readonly submitted_by: number | null;
  readonly instrument_id: number;
  readonly fap_id: number;
}

export interface FapProposalWithReviewGradesAndRankingRecord {
  readonly proposal_pk: number;
  readonly rank_order: number | null;
  readonly review_grades: number[];
}

export interface ProposalEventsRecord {
  readonly proposal_pk: number;
  readonly proposal_created: boolean;
  readonly proposal_submitted: boolean;
  readonly proposal_feasibility_review_feasible: boolean;
  readonly proposal_feasibility_review_unfeasible: boolean;
  readonly call_ended: boolean;
  readonly call_ended_internal: boolean;
  readonly call_review_ended: boolean;
  readonly proposal_faps_selected: boolean;
  readonly proposal_instruments_selected: boolean;
  readonly proposal_feasibility_review_submitted: boolean;
  readonly proposal_sample_review_submitted: boolean;
  readonly proposal_all_fap_reviewers_selected: boolean;
  readonly proposal_management_decision_updated: boolean;
  readonly proposal_management_decision_submitted: boolean;
  readonly proposal_all_fap_reviews_submitted: boolean;
  readonly proposal_fap_review_updated: boolean;
  readonly proposal_feasibility_review_updated: boolean;
  readonly proposal_sample_safe: boolean;
  readonly proposal_fap_review_submitted: boolean;
  readonly proposal_fap_meeting_submitted: boolean;
  readonly proposal_all_fap_meetings_submitted: boolean;
  readonly proposal_all_reviews_submitted_for_all_faps: boolean;
  readonly proposal_all_fap_meeting_instrument_submitted: boolean;
  readonly proposal_instrument_submitted: boolean;
  readonly proposal_accepted: boolean;
  readonly proposal_reserved: boolean;
  readonly proposal_rejected: boolean;
  readonly proposal_notified: boolean;
  readonly proposal_booking_time_activated: boolean;
  readonly proposal_booking_time_updated: boolean;
  readonly proposal_booking_time_slot_added: boolean;
  readonly proposal_booking_time_slots_removed: boolean;
  readonly proposal_booking_time_completed: boolean;
  readonly proposal_booking_time_reopened: boolean;
}

export interface FeatureRecord {
  readonly feature_id: string;
  readonly is_enabled: boolean;
  readonly description: string;
}

export interface SettingsRecord {
  readonly settings_id: string;
  readonly settings_value: string;
  readonly description: string;
}

export const createPageObject = (record: PageTextRecord) => {
  return new Page(record.pagetext_id, record.content);
};

export interface TokensAndPermissionsRecord {
  readonly access_token_id: string;
  readonly name: string;
  readonly access_token: string;
  readonly access_permissions: string;
}

export interface VisitRecord {
  readonly visit_id: number;
  readonly proposal_pk: number;
  readonly instrument_id: number;
  readonly status: string;
  readonly questionary_id: number;
  readonly creator_id: number;
  readonly team_lead_user_id: number;
  readonly scheduled_event_id: number;
  readonly created_at: Date;
}

export interface EsiRecord {
  readonly esi_id: number;
  readonly scheduled_event_id: number;
  readonly creator_id: number;
  readonly questionary_id: number;
  readonly is_submitted: boolean;
  readonly created_at: Date;
}

export interface GenericTemplateRecord {
  readonly generic_template_id: number;
  readonly title: string;
  readonly creator_id: number;
  readonly proposal_pk: number;
  readonly questionary_id: number;
  readonly question_id: string;
  readonly created_at: Date;
}

export interface SampleEsiRecord {
  readonly esi_id: number;
  readonly sample_id: number;
  readonly questionary_id: number;
  readonly is_submitted: boolean;
}

export interface TemplateGroupRecord {
  readonly template_group_id: string;
  readonly category_id: number;
}

export interface FeedbackRecord {
  readonly feedback_id: number;
  readonly scheduled_event_id: number;
  readonly status: FeedbackStatus;
  readonly questionary_id: number;
  readonly creator_id: number;
  readonly created_at: Date;
  readonly submitted_at: Date;
}

export interface FeedbackRequestRecord {
  readonly feedback_request_id: number;
  readonly scheduled_event_id: number;
  readonly requested_at: Date;
}

export interface QuantityRecord {
  readonly quantity_id: string;
}

export interface RedeemCodeRecord {
  readonly code: string;
  readonly placeholder_user_id: number;
  readonly created_by: number;
  readonly created_at: Date;
  readonly claimed_by: number | null;
  readonly claimed_at: Date | null;
}

export interface ProposalStatusActionRecord {
  readonly proposal_status_action_id: number;
  readonly name: string;
  readonly description: string;
  readonly type: ProposalStatusActionType;
}

export interface ProposalWorkflowConnectionHasActionsRecord {
  readonly connection_id: number;
  readonly action_id: number;
  readonly workflow_id: number;
  readonly config: string;
}

export const createTopicObject = (record: TopicRecord) => {
  return new Topic(
    record.topic_id,
    record.topic_title,
    record.template_id,
    record.sort_order,
    record.is_enabled
  );
};

export const createQuestionObject = (question: QuestionRecord) => {
  return new Question(
    question.category_id,
    question.question_id,
    question.natural_key,
    question.data_type as DataType,
    question.question,
    createConfig<any>(question.data_type as DataType, question.default_config)
  );
};

export const createProposalTemplateObject = (template: TemplateRecord) => {
  return new Template(
    template.template_id,
    template.group_id as TemplateGroupId,
    template.name,
    template.description,
    template.is_archived
  );
};

export const createProposalObject = (proposal: ProposalRecord) => {
  return new Proposal(
    proposal.proposal_pk,
    proposal.title || '',
    proposal.abstract || '',
    proposal.proposer_id,
    proposal.status_id,
    proposal.created_at,
    proposal.updated_at,
    proposal.proposal_id,
    proposal.final_status,
    proposal.call_id,
    proposal.questionary_id,
    proposal.comment_for_user,
    proposal.comment_for_management,
    proposal.notified,
    proposal.submitted,
    proposal.reference_number_sequence,
    proposal.management_decision_submitted,
    proposal.submitted_date
  );
};

export const createReviewObject = (review: ReviewRecord) => {
  return new Review(
    review.review_id,
    review.proposal_pk,
    review.user_id,
    review.comment,
    review.grade,
    review.status,
    review.fap_id,
    review.questionary_id
  );
};

export const createInstrumentObject = (instrument: InstrumentRecord) => {
  return new Instrument(
    instrument.instrument_id,
    instrument.name,
    instrument.short_code,
    instrument.description,
    instrument.manager_user_id
  );
};

export const createTechnicalReviewObject = (
  technicalReview: TechnicalReviewRecord
) => {
  return new TechnicalReview(
    technicalReview.technical_review_id,
    technicalReview.proposal_pk,
    technicalReview.comment,
    technicalReview.public_comment,
    technicalReview.time_allocation,
    technicalReview.status,
    technicalReview.submitted,
    technicalReview.reviewer_id,
    technicalReview.files ? JSON.stringify(technicalReview.files) : null,
    technicalReview.technical_review_assignee_id,
    technicalReview.instrument_id
  );
};

export const createProposalViewObject = (proposal: ProposalViewRecord) => {
  return new ProposalView(
    proposal.proposal_pk,
    proposal.title || '',
    proposal.principal_investigator,
    proposal.proposal_status_id,
    proposal.proposal_status_name,
    proposal.proposal_status_description,
    proposal.proposal_id,
    proposal.final_status,
    proposal.notified,
    proposal.submitted,
    proposal.instruments,
    proposal.technical_reviews,
    proposal.faps,
    proposal.fap_instruments,
    proposal.call_short_code,
    proposal.allocation_time_unit,
    proposal.call_id,
    proposal.proposal_workflow_id,
    proposal.submitted_date,
    proposal.techniques
  );
};

export const createFieldDependencyObject = (
  fieldDependency: FieldDependencyRecord & { natural_key: string }
) => {
  const conditionJson = JSON.parse(fieldDependency.condition);

  return new FieldDependency(
    fieldDependency.question_id,
    fieldDependency.proposal_question_dependency,
    fieldDependency.natural_key,
    new FieldCondition(
      conditionJson.condition.toUpperCase(),
      conditionJson.params
    )
  );
};

export const createFileMetadata = (record: FileRecord) => {
  return new FileMetadata(
    record.file_id,
    record.oid,
    record.file_name,
    record.mime_type,
    record.size_in_bytes,
    record.created_at
  );
};

export const createQuestionTemplateRelationObject = async <T extends DataType>(
  record: QuestionRecord &
    QuestionTemplateRelRecord & {
      config: QuestionDataTypeConfigMapping<T>;
      dependency_natural_key: string;
    },
  dependencies: FieldDependency[],
  callId?: number
) => {
  // The default config data doesn't contain all the data for all the Components. For Components like InstrumentPicker and DynamicMultipleChoice, the config data is being overwritten in the run time.
  // Technically, any Questionary Component with a function transformConfig must be doing the config changes.
  const transformedConfig = await getTransformedConfigData(
    record.data_type,
    record.config,
    callId
  );

  return new QuestionTemplateRelation(
    new Question(
      record.category_id,
      record.question_id,
      record.natural_key,
      record.data_type as DataType,
      record.question,
      createConfig<any>(record.data_type as DataType, record.default_config)
    ),
    record.topic_id,
    record.sort_order,
    createConfig<any>(record.data_type as DataType, transformedConfig),
    dependencies,
    record.dependencies_operator
  );
};

export const createUserObject = (user: UserRecord) => {
  return new User(
    user.user_id,
    user.user_title,
    user.firstname,
    user.middlename,
    user.lastname,
    user.username,
    user.preferredname,
    user.oidc_sub,
    user.oauth_refresh_token,
    user.oauth_issuer,
    user.gender,
    user.nationality,
    user.birthdate,
    user.institution_id,
    user.institution,
    user.department,
    user.position,
    user.email,
    user.telephone,
    user.telephone_alt,
    user.placeholder,
    user.created_at.toISOString(),
    user.updated_at.toISOString()
  );
};

export const createBasicUserObject = (
  user: UserRecord & InstitutionRecord & CountryRecord
) => {
  return new BasicUserDetails(
    user.user_id,
    user.firstname,
    user.lastname,
    user.preferredname,
    user.institution,
    user.institution_id,
    user.position,
    user.created_at,
    user.placeholder,
    user.email,
    user.country
  );
};

export const createVisitRegistrationObject = (
  record: VisitRegistrationRecord
) => {
  return new VisitRegistration(
    record.user_id,
    record.visit_id,
    record.registration_questionary_id,
    record.is_registration_submitted,
    record.starts_at,
    record.ends_at,
    record.training_expiry_date
  );
};

export const createCallObject = (call: CallRecord) => {
  return new Call(
    call.call_id,
    call.call_short_code,
    call.start_call,
    call.end_call,
    call.end_call_internal,
    call.start_review,
    call.end_review,
    call.start_fap_review,
    call.end_fap_review,
    call.start_notify,
    call.end_notify,
    call.start_cycle,
    call.end_cycle,
    call.cycle_comment,
    call.survey_comment,
    call.submission_message,
    call.reference_number_format,
    call.proposal_sequence,
    call.proposal_workflow_id,
    call.call_ended,
    call.call_ended_internal,
    call.call_review_ended,
    call.call_fap_review_ended,
    call.template_id,
    call.esi_template_id,
    call.allocation_time_unit,
    call.title,
    call.description,
    call.pdf_template_id,
    call.fap_review_template_id,
    call.is_active
  );
};

export const createCallHasInstrumentObject = (
  callHasInstrument: CallHasInstrumentRecord
) => {
  return new CallHasInstrument(
    callHasInstrument.call_id,
    callHasInstrument.instrument_id,
    callHasInstrument.availability_time,
    callHasInstrument.submitted,
    callHasInstrument.fap_id
  );
};

export const createQuestionaryObject = (questionary: QuestionaryRecord) => {
  return new Questionary(
    questionary.questionary_id,
    questionary.template_id,
    questionary.creator_id,
    questionary.created_at
  );
};

export const createTemplateCategoryObject = (
  templateCategory: TemplateCategoryRecord
) => {
  return new TemplateCategory(
    templateCategory.template_category_id,
    templateCategory.name
  );
};

export const createSampleObject = (sample: SampleRecord) => {
  return new Sample(
    sample.sample_id,
    sample.title,
    sample.creator_id,
    sample.proposal_pk,
    sample.questionary_id,
    sample.question_id,
    sample.is_post_proposal_submission,
    sample.safety_status,
    sample.safety_comment,
    sample.created_at,
    sample.shipment_id
  );
};

export const createAnswerBasic = (answer: AnswerRecord) => {
  return new AnswerBasic(
    answer.answer_id,
    answer.questionary_id,
    answer.question_id,
    answer.answer,
    answer.created_at
  );
};

export const createShipmentObject = (shipment: ShipmentRecord) => {
  return new Shipment(
    shipment.shipment_id,
    shipment.title,
    shipment.creator_id,
    shipment.proposal_pk,
    shipment.questionary_id,
    shipment.scheduled_event_id,
    shipment.status as ShipmentStatus,
    shipment.external_ref,
    shipment.created_at
  );
};

export const createFeatureObject = (record: FeatureRecord) => {
  return new Feature(
    record.feature_id as FeatureId,
    record.is_enabled,
    record.description
  );
};

export const createSettingsObject = (record: SettingsRecord) => {
  return new Settings(
    record.settings_id as SettingsId,
    record.settings_value,
    record.description
  );
};

export const createFapObject = (fap: FapRecord) => {
  return new Fap(
    fap.fap_id,
    fap.code,
    fap.description,
    fap.number_ratings_required,
    fap.grade_guide,
    fap.custom_grade_guide,
    fap.active,
    [],
    [],
    fap.files ? JSON.stringify(fap.files) : null
  );
};

export const createFapMeetingDecisionObject = (
  fapMeetingDecisionRecord: FapMeetingDecisionRecord
) => {
  return new FapMeetingDecision(
    fapMeetingDecisionRecord.proposal_pk,
    fapMeetingDecisionRecord.rank_order,
    fapMeetingDecisionRecord.recommendation,
    fapMeetingDecisionRecord.comment_for_user,
    fapMeetingDecisionRecord.comment_for_management,
    fapMeetingDecisionRecord.submitted,
    fapMeetingDecisionRecord.submitted_by,
    fapMeetingDecisionRecord.instrument_id,
    fapMeetingDecisionRecord.fap_id
  );
};

export const createFapProposalObject = (fapProposal: FapProposalRecord) => {
  return new FapProposal(
    fapProposal.fap_proposal_id,
    fapProposal.proposal_pk,
    fapProposal.fap_id,
    fapProposal.date_assigned,
    fapProposal.fap_time_allocation,
    fapProposal.instrument_id,
    fapProposal.call_id,
    fapProposal.fap_meeting_instrument_submitted
  );
};
export const createFapAssignmentObject = (
  fapAssignment: FapAssignmentRecord
) => {
  return new FapAssignment(
    fapAssignment.proposal_pk,
    fapAssignment.fap_member_user_id,
    fapAssignment.fap_id,
    fapAssignment.date_assigned,
    fapAssignment.reassigned,
    fapAssignment.date_reassigned,
    fapAssignment.email_sent,
    fapAssignment.rank
  );
};

export const createFapReviewerObject = (fapMember: FapReviewerRecord) => {
  return new FapReviewer(fapMember.user_id, fapMember.fap_id);
};

export const createRoleObject = (role: RoleRecord) => {
  return new Role(role.role_id, role.short_code, role.title);
};

export const createVisitObject = (visit: VisitRecord) => {
  return new Visit(
    visit.visit_id,
    visit.proposal_pk,
    visit.status as any as VisitStatus,
    visit.creator_id,
    visit.team_lead_user_id,
    visit.scheduled_event_id,
    visit.created_at
  );
};

export const createEsiObject = (esi: EsiRecord) => {
  return new ExperimentSafetyInput(
    esi.esi_id,
    esi.scheduled_event_id,
    esi.creator_id,
    esi.questionary_id,
    esi.is_submitted,
    esi.created_at
  );
};

export const createGenericTemplateObject = (
  genericTemplate: GenericTemplateRecord
) => {
  return new GenericTemplate(
    genericTemplate.generic_template_id,
    genericTemplate.title,
    genericTemplate.creator_id,
    genericTemplate.proposal_pk,
    genericTemplate.questionary_id,
    genericTemplate.question_id,
    genericTemplate.created_at
  );
};

export const createSampleEsiObject = (esi: SampleEsiRecord) => {
  return new SampleExperimentSafetyInput(
    esi.esi_id,
    esi.sample_id,
    esi.questionary_id,
    esi.is_submitted
  );
};

export const createTemplateGroupObject = (group: TemplateGroupRecord) => {
  return new TemplateGroup(
    group.template_group_id as TemplateGroupId,
    group.category_id
  );
};

export const createInstitutionObject = (institution: InstitutionRecord) => {
  return new Institution(
    institution.institution_id,
    institution.institution,
    institution.country_id,
    institution.ror_id
  );
};

export const createCountryObject = (country: CountryRecord) => {
  return new Country(country.country_id, country.country);
};

export const createScheduledEventObject = (
  scheduledEvent: ScheduledEventRecord
) =>
  new ScheduledEventCore(
    scheduledEvent.scheduled_event_id,
    scheduledEvent.booking_type,
    scheduledEvent.starts_at,
    scheduledEvent.ends_at,
    scheduledEvent.proposal_pk,
    scheduledEvent.proposal_booking_id,
    scheduledEvent.status,
    scheduledEvent.local_contact,
    scheduledEvent.instrument_id
  );

export const createFeedbackObject = (scheduledEvent: FeedbackRecord) =>
  new Feedback(
    scheduledEvent.feedback_id,
    scheduledEvent.scheduled_event_id,
    scheduledEvent.status,
    scheduledEvent.questionary_id,
    scheduledEvent.creator_id,
    scheduledEvent.created_at,
    scheduledEvent.submitted_at
  );

export const createFeedbackRequestObject = (
  feedbackRequest: FeedbackRequestRecord
) =>
  new FeedbackRequest(
    feedbackRequest.feedback_request_id,
    feedbackRequest.scheduled_event_id,
    feedbackRequest.requested_at
  );

export const createUnitObject = (unit: UnitRecord) =>
  new Unit(
    unit.unit_id,
    unit.unit,
    unit.quantity,
    unit.symbol,
    unit.si_conversion_formula
  );

export const createPredefinedMessageObject = (
  predefinedMessage: PredefinedMessageRecord
) =>
  new PredefinedMessage(
    predefinedMessage.predefined_message_id,
    predefinedMessage.title,
    predefinedMessage.message,
    predefinedMessage.date_modified,
    predefinedMessage.last_modified_by
  );

export const createQuantityObject = (quantity: QuantityRecord) =>
  new Quantity(quantity.quantity_id);

export const createPdfTemplateObject = (pdfTemplate: PdfTemplateRecord) => {
  return new PdfTemplate(
    pdfTemplate.pdf_template_id,
    pdfTemplate.template_id,
    pdfTemplate.template_data,
    pdfTemplate.template_header,
    pdfTemplate.template_footer,
    pdfTemplate.template_sample_declaration,
    pdfTemplate.dummy_data,
    pdfTemplate.creator_id,
    pdfTemplate.created_at
  );
};

export const createRedeemCodeObject = (invite: RedeemCodeRecord) =>
  new RedeemCode(
    invite.code,
    invite.placeholder_user_id,
    invite.created_by,
    invite.created_at,
    invite.claimed_by,
    invite.claimed_at
  );

export interface TechniqueRecord {
  readonly technique_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly full_count: number;
}

export interface TechniqueHasInstrumentsRecord {
  readonly technique_id: number;
  readonly instrument_id: number;
}
