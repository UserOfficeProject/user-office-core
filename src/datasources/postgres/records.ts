import { Page } from '../../models/Admin';
import { FileMetadata } from '../../models/Blob';
import { AllocationTimeUnits, Call } from '../../models/Call';
import {
  DependenciesLogicOperator,
  EvaluatorOperator,
} from '../../models/ConditionEvaluator';
import { Feature, FeatureId } from '../../models/Feature';
import { Feedback } from '../../models/Feedback';
import { FeedbackRequest } from '../../models/FeedbackRequest';
import { GenericTemplate } from '../../models/GenericTemplate';
import { Institution } from '../../models/Institution';
import { Proposal, ProposalEndStatus } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { Quantity } from '../../models/Quantity';
import { AnswerBasic, Questionary } from '../../models/Questionary';
import { createConfig } from '../../models/questionTypes/QuestionRegistry';
import { Role } from '../../models/Role';
import { Sample } from '../../models/Sample';
import { SampleExperimentSafetyInput } from '../../models/SampleExperimentSafetyInput';
import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { SEP, SEPProposal, SEPAssignment, SEPReviewer } from '../../models/SEP';
import { SepMeetingDecision } from '../../models/SepMeetingDecision';
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
import { ExperimentSafetyInput } from './../../models/ExperimentSafetyInput';
import { FeedbackStatus } from './../../models/Feedback';

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
  readonly management_time_allocation: number;
  readonly management_decision_submitted: boolean;
}
export interface ProposalViewRecord {
  readonly proposal_pk: number;
  readonly title: string;
  readonly proposal_status_id: number;
  readonly proposal_status_name: string;
  readonly proposal_status_description: string;
  readonly proposal_id: string;
  readonly rank_order: number;
  readonly final_status: number;
  readonly technical_time_allocation: number;
  readonly management_time_allocation: number;
  readonly notified: boolean;
  readonly technical_review_status: number;
  readonly technical_review_submitted: boolean;
  readonly technical_review_assignee_id: number;
  readonly technical_review_assignee_firstname: string;
  readonly technical_review_assignee_lastname: string;
  readonly call_short_code: string;
  readonly sep_id: number;
  readonly sep_code: string;
  readonly average: number;
  readonly deviation: number;
  readonly proposal_instrument_name: string;
  readonly proposal_instrument_id: number;
  readonly call_instrument_name: string;
  readonly call_instrument_id: number;
  readonly call_id: number;
  readonly submitted: boolean;
  readonly allocation_time_unit: AllocationTimeUnits;
  readonly full_count: number;
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
  readonly data_type: string;
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
  readonly config: string;
  readonly dependencies_operator?: DependenciesLogicOperator;
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
  readonly orcid: string;
  readonly gender: string;
  readonly nationality: number;
  readonly birthdate: Date;
  readonly organisation: number;
  readonly department: string;
  readonly organisation_address: string;
  readonly position: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly password: string;
  readonly telephone: string;
  readonly telephone_alt: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly full_count: number;
  readonly institution: string;
  readonly placeholder: boolean;
  readonly orcid_refreshtoken: string;
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
  readonly sep_id: number;
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
}

export interface CallRecord {
  readonly call_id: number;
  readonly call_short_code: string;
  readonly start_call: Date;
  readonly end_call: Date;
  readonly start_review: Date;
  readonly end_review: Date;
  readonly start_sep_review: Date;
  readonly end_sep_review: Date;
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
  readonly call_review_ended: boolean;
  readonly call_sep_review_ended: boolean;
  readonly template_id: number;
  readonly esi_template_id: number;
  readonly allocation_time_unit: AllocationTimeUnits;
  readonly title: string;
  readonly description: string;
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
  readonly verified: boolean;
}

export interface UnitRecord {
  readonly unit_id: string;
  readonly unit: string;
  readonly quantity: string;
  readonly symbol: string;
  readonly si_conversion_formula: string;
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
  readonly changed_by: number;
  readonly event_type: string;
  readonly row_data: string;
  readonly event_tstamp: Date;
  readonly changed_object_id: string;
}

export interface SEPRecord {
  readonly sep_id: number;
  readonly code: string;
  readonly description: string;
  readonly number_ratings_required: number;
  readonly active: boolean;
  readonly full_count: number;
  readonly sep_chair_user_id: number | null;
  readonly sep_secretary_user_id: number | null;
}

export interface SEPProposalRecord {
  readonly proposal_pk: number;
  readonly sep_id: number;
  readonly date_assigned: Date;
  readonly sep_time_allocation: number | null;
  readonly instrument_submitted?: boolean;
}

export interface SEPAssignmentRecord {
  readonly proposal_pk: number;
  readonly sep_member_user_id: number;
  readonly sep_id: number;
  readonly date_assigned: Date;
  readonly reassigned: boolean;
  readonly date_reassigned: Date;
  readonly email_sent: boolean;
}

export interface SEPReviewerRecord {
  readonly user_id: number;
  readonly sep_id: number;
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

export interface InstrumentHasProposalsRecord {
  readonly instrument_id: number;
  readonly proposal_pk: number;
  readonly submitted: boolean;
}

export interface InstrumentWithAvailabilityTimeRecord {
  readonly instrument_id: number;
  readonly name: string;
  readonly short_code: string;
  readonly description: string;
  readonly manager_user_id: number;
  readonly availability_time: number;
  readonly submitted: boolean;
  readonly proposal_count: number;
  readonly full_count: number;
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

export interface SepMeetingDecisionRecord {
  readonly proposal_pk: number;
  readonly comment_for_management: string;
  readonly comment_for_user: string;
  readonly rank_order: number;
  readonly recommendation: ProposalEndStatus;
  readonly submitted: boolean;
  readonly submitted_by: number | null;
}

export interface SepProposalWithReviewGradesAndRankingRecord {
  readonly proposal_pk: number;
  readonly rank_order: number | null;
  readonly review_grades: number[];
}

export interface ProposalEventsRecord {
  readonly proposal_pk: number;
  readonly proposal_created: boolean;
  readonly proposal_submitted: boolean;
  readonly proposal_feasible: boolean;
  readonly proposal_unfeasible: boolean;
  readonly call_ended: boolean;
  readonly call_review_ended: boolean;
  readonly proposal_sep_selected: boolean;
  readonly proposal_instrument_selected: boolean;
  readonly proposal_feasibility_review_submitted: boolean;
  readonly proposal_sample_review_submitted: boolean;
  readonly proposal_all_sep_reviewers_selected: boolean;
  readonly proposal_management_decision_updated: boolean;
  readonly proposal_management_decision_submitted: boolean;
  readonly proposal_all_sep_reviews_submitted: boolean;
  readonly proposal_sep_review_updated: boolean;
  readonly proposal_feasibility_review_updated: boolean;
  readonly proposal_sample_safe: boolean;
  readonly proposal_sep_review_submitted: boolean;
  readonly proposal_sep_meeting_submitted: boolean;
  readonly proposal_instrument_submitted: boolean;
  readonly proposal_accepted: boolean;
  readonly proposal_reserved: boolean;
  readonly proposal_rejected: boolean;
  readonly proposal_notified: boolean;
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
    proposal.management_time_allocation,
    proposal.management_decision_submitted
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
    technicalReview.technical_review_assignee_id
  );
};

export const createProposalViewObject = (proposal: ProposalViewRecord) => {
  return new ProposalView(
    proposal.proposal_pk,
    proposal.title || '',
    proposal.proposal_status_id,
    proposal.proposal_status_name,
    proposal.proposal_status_description,
    proposal.proposal_id,
    proposal.rank_order,
    proposal.final_status,
    proposal.notified,
    proposal.technical_time_allocation,
    proposal.management_time_allocation,
    proposal.technical_review_assignee_id,
    proposal.technical_review_assignee_firstname,
    proposal.technical_review_assignee_lastname,
    proposal.technical_review_status,
    proposal.technical_review_submitted,
    proposal.proposal_instrument_name
      ? proposal.proposal_instrument_name
      : proposal.call_instrument_name,
    proposal.call_short_code,
    proposal.sep_code,
    proposal.sep_id,
    proposal.average,
    proposal.deviation,
    proposal.proposal_instrument_id
      ? proposal.proposal_instrument_id
      : proposal.call_instrument_id,
    proposal.allocation_time_unit,
    proposal.call_id,
    proposal.submitted
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

export const createQuestionTemplateRelationObject = (
  record: QuestionRecord &
    QuestionTemplateRelRecord & { dependency_natural_key: string },
  dependencies: FieldDependency[]
) => {
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
    createConfig<any>(record.data_type as DataType, record.config),
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
    user.orcid,
    user.orcid_refreshtoken,
    user.gender,
    user.nationality,
    user.birthdate,
    user.organisation,
    user.department,
    user.position,
    user.email,
    user.email_verified,
    user.telephone,
    user.telephone_alt,
    user.placeholder,
    user.created_at.toISOString(),
    user.updated_at.toISOString()
  );
};

export const createBasicUserObject = (user: UserRecord) => {
  return new BasicUserDetails(
    user.user_id,
    user.firstname,
    user.lastname,
    user.preferredname,
    user.institution,
    user.position,
    user.created_at,
    user.placeholder
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
    call.start_review,
    call.end_review,
    call.start_sep_review,
    call.end_sep_review,
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
    call.call_review_ended,
    call.call_sep_review_ended,
    call.template_id,
    call.esi_template_id,
    call.allocation_time_unit,
    call.title,
    call.description
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

export const createSEPObject = (sep: SEPRecord) => {
  return new SEP(
    sep.sep_id,
    sep.code,
    sep.description,
    sep.number_ratings_required,
    sep.active,
    sep.sep_chair_user_id,
    sep.sep_secretary_user_id
  );
};

export const createSepMeetingDecisionObject = (
  sepMeetingDecisionRecord: SepMeetingDecisionRecord
) => {
  return new SepMeetingDecision(
    sepMeetingDecisionRecord.proposal_pk,
    sepMeetingDecisionRecord.rank_order,
    sepMeetingDecisionRecord.recommendation,
    sepMeetingDecisionRecord.comment_for_user,
    sepMeetingDecisionRecord.comment_for_management,
    sepMeetingDecisionRecord.submitted,
    sepMeetingDecisionRecord.submitted_by
  );
};

export const createSEPProposalObject = (sepAssignment: SEPProposalRecord) => {
  return new SEPProposal(
    sepAssignment.proposal_pk,
    sepAssignment.sep_id,
    sepAssignment.date_assigned,
    sepAssignment.sep_time_allocation,
    sepAssignment.instrument_submitted
  );
};
export const createSEPAssignmentObject = (
  sepAssignment: SEPAssignmentRecord
) => {
  return new SEPAssignment(
    sepAssignment.proposal_pk,
    sepAssignment.sep_member_user_id,
    sepAssignment.sep_id,
    sepAssignment.date_assigned,
    sepAssignment.reassigned,
    sepAssignment.date_reassigned,
    sepAssignment.email_sent
  );
};

export const createSEPReviewerObject = (sepMember: SEPReviewerRecord) => {
  return new SEPReviewer(sepMember.user_id, sepMember.sep_id);
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
    institution.verified
  );
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
    scheduledEvent.local_contact
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

export const createQuantityObject = (quantity: QuantityRecord) =>
  new Quantity(quantity.quantity_id);
